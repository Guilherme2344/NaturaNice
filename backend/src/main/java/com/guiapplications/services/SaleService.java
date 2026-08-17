package com.guiapplications.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;

import com.guiapplications.entities.Product;
import com.guiapplications.entities.Sale;
import com.guiapplications.entities.SaleItem;
import com.guiapplications.entities.dto.SaleRequestDTO;
import com.guiapplications.entities.dto.SaleResponseDTO;
import com.guiapplications.exceptions.ResourceNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class SaleService {

    @Transactional
    public SaleResponseDTO createSale(SaleRequestDTO dto) {
        if (dto.productId() == null) {
            throw new IllegalArgumentException("ID do produto é obrigatório.");
        }

        if (dto.quantity() == null || dto.quantity() <= 0) {
            throw new IllegalArgumentException("A quantidade vendida deve ser maior que zero.");
        }

        Product product = Product.findById(dto.productId());
        if (product == null) {
            throw new ResourceNotFoundException("Produto não encontrado com id: " + dto.productId());
        }

        int currentStock = product.quantity != null ? product.quantity : 0;
        if (currentStock < dto.quantity()) {
            throw new IllegalArgumentException("Estoque insuficiente. Estoque atual: " + currentStock);
        }

        Long productId = product.id;
        String productName = product.name;
        BigDecimal unitSellingPrice = dto.sellingPrice() != null ? dto.sellingPrice() : product.sellingPrice;
        BigDecimal unitPurchasePrice = product.purchasePrice != null ? product.purchasePrice : BigDecimal.ZERO;

        // 1. Create & Persist Sale and SaleItem
        Sale sale = new Sale();
        sale.saleDate = LocalDateTime.now();
        sale.items = new ArrayList<>();

        SaleItem item = new SaleItem();
        item.sale = sale;
        item.product = product;
        item.quantity = dto.quantity();
        item.purchasePrice = unitPurchasePrice;
        item.sellingPrice = unitSellingPrice;

        sale.items.add(item);
        sale.persist();

        // 2. Update stock or auto-delete product if quantity reaches 0
        int newStock = currentStock - dto.quantity();
        if (newStock <= 0) {
            item.product = null;
            SaleItem.update("product = null WHERE product.id = ?1", productId);
            product.delete();
        } else {
            product.quantity = newStock;
            product.persist();
        }

        BigDecimal totalAmount = unitSellingPrice.multiply(BigDecimal.valueOf(dto.quantity()));
        BigDecimal totalProfit = unitSellingPrice.subtract(unitPurchasePrice).multiply(BigDecimal.valueOf(dto.quantity()));

        return new SaleResponseDTO(
            sale.id,
            sale.saleDate,
            productId,
            productName,
            dto.quantity(),
            unitPurchasePrice,
            unitSellingPrice,
            totalAmount,
            totalProfit
        );
    }
}
