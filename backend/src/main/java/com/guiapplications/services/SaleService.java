package com.guiapplications.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.UUID;

import com.guiapplications.entities.Customer;
import com.guiapplications.entities.Product;
import com.guiapplications.entities.Sale;
import com.guiapplications.entities.SaleItem;
import com.guiapplications.entities.SalePayment;
import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.SaleRequestDTO;
import com.guiapplications.entities.dto.SaleResponseDTO;
import com.guiapplications.enums.SaleStatus;
import com.guiapplications.exceptions.ResourceNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class SaleService {

    @Transactional
    public SaleResponseDTO createSale(SaleRequestDTO dto, User user) {
        if (user == null) {
            throw new IllegalArgumentException("Sessão inválida ou expirada. Faça login novamente.");
        }
        if (dto.productId() == null) {
            throw new IllegalArgumentException("ID do produto é obrigatório.");
        }
        if (dto.quantity() == null || dto.quantity() <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser maior que zero.");
        }
        if (dto.sellingPrice() == null || dto.sellingPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Preço de venda deve ser maior que zero.");
        }

        UUID productId = dto.productId();
        Product product = Product.findById(productId);
        if (product == null) {
            throw new ResourceNotFoundException("Produto com ID " + productId + " não encontrado.");
        }

        int currentStock = product.quantity != null ? product.quantity : 0;
        if (dto.quantity() > currentStock) {
            throw new IllegalArgumentException(
                "Quantidade solicitada (" + dto.quantity() + ") é maior do que o estoque disponível (" + currentStock + ")."
            );
        }

        String productName = product.name;
        BigDecimal unitPurchasePrice = product.purchasePrice != null ? product.purchasePrice : BigDecimal.ZERO;
        BigDecimal unitSellingPrice = dto.sellingPrice();

        BigDecimal totalAmount = unitSellingPrice.multiply(BigDecimal.valueOf(dto.quantity()));
        BigDecimal amountPaid = dto.amountPaid() != null ? dto.amountPaid() : totalAmount;

        SaleStatus status = SaleStatus.PAID;
        if (amountPaid.compareTo(BigDecimal.ZERO) == 0) {
            status = SaleStatus.PARTIALLY_PAID;
        } else if (amountPaid.compareTo(totalAmount) < 0) {
            status = SaleStatus.PARTIALLY_PAID;
        }

        // Customer lookup or creation
        Customer customer = null;
        if (dto.customerName() != null && !dto.customerName().isBlank()) {
            String trimmedName = dto.customerName().trim();
            customer = Customer.findByNameAndUser(trimmedName, user);
            if (customer == null) {
                customer = new Customer();
                customer.name = trimmedName;
                customer.user = user;
                customer.persist();
            }
        }

        // 1. Create & Persist Sale and SaleItem
        Sale sale = new Sale();
        sale.saleDate = LocalDateTime.now();
        sale.amountPaid = amountPaid;
        sale.status = status;
        sale.customer = customer;
        sale.user = user;
        sale.items = new ArrayList<>();

        SaleItem item = new SaleItem();
        item.sale = sale;
        item.product = product;
        item.productName = product.name;
        item.quantity = dto.quantity();
        item.purchasePrice = unitPurchasePrice;
        item.sellingPrice = unitSellingPrice;

        sale.items.add(item);
        sale.persist();

        if (amountPaid.compareTo(BigDecimal.ZERO) > 0) {
            SalePayment initialPayment = new SalePayment();
            initialPayment.sale = sale;
            initialPayment.paymentDate = sale.saleDate;
            initialPayment.amount = amountPaid;
            initialPayment.persist();
        }

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

        BigDecimal totalProfit = unitSellingPrice.subtract(unitPurchasePrice).multiply(BigDecimal.valueOf(dto.quantity()));
        BigDecimal remainingAmount = totalAmount.subtract(amountPaid);
        if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) {
            remainingAmount = BigDecimal.ZERO;
        }

        return new SaleResponseDTO(
            sale.id,
            sale.saleDate,
            productId,
            productName,
            dto.quantity(),
            unitPurchasePrice,
            unitSellingPrice,
            totalAmount,
            amountPaid,
            remainingAmount,
            totalProfit,
            status.name(),
            status.getDescription(),
            customer != null ? customer.name : null
        );
    }

    @Transactional
    public void addSalePayment(UUID saleId, BigDecimal amount, User user) {
        if (user == null) {
            throw new IllegalArgumentException("Sessão inválida ou expirada. Faça login novamente.");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor do abatimento deve ser maior que zero.");
        }

        Sale sale = Sale.findById(saleId);
        if (sale == null) {
            throw new ResourceNotFoundException("Venda não encontrada com o ID: " + saleId);
        }

        BigDecimal saleTotal = BigDecimal.ZERO;
        if (sale.items != null) {
            for (SaleItem item : sale.items) {
                saleTotal = saleTotal.add(item.getTotalAmount());
            }
        }

        BigDecimal currentPaid = sale.amountPaid != null ? sale.amountPaid : (sale.status == SaleStatus.PAID ? saleTotal : BigDecimal.ZERO);
        BigDecimal newPaid = currentPaid.add(amount);

        sale.amountPaid = newPaid;
        if (newPaid.compareTo(saleTotal) >= 0) {
            sale.status = SaleStatus.PAID;
        } else {
            sale.status = SaleStatus.PARTIALLY_PAID;
        }
        sale.persist();

        SalePayment payment = new SalePayment();
        payment.sale = sale;
        payment.paymentDate = LocalDateTime.now();
        payment.amount = amount;
        payment.persist();
    }
}
