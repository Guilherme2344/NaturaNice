package com.guiapplications.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import com.guiapplications.entities.Product;
import com.guiapplications.entities.ProductBatch;
import com.guiapplications.entities.SaleItem;
import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.ProductBatchRequestDTO;
import com.guiapplications.entities.dto.ProductBatchResponseDTO;
import com.guiapplications.exceptions.ResourceNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class ProductBatchService {

    private BigDecimal resolvePurchasePrice(BigDecimal purchasePrice, BigDecimal sellingPrice) {
        if (purchasePrice == null || purchasePrice.compareTo(BigDecimal.ZERO) == 0) {
            if (sellingPrice != null && sellingPrice.compareTo(BigDecimal.ZERO) > 0) {
                return sellingPrice.multiply(new BigDecimal("0.70")).setScale(2, RoundingMode.HALF_UP);
            }
            return BigDecimal.ZERO;
        }
        return purchasePrice;
    }

    @Transactional
    public ProductBatchResponseDTO createBatch(ProductBatchRequestDTO dto, User user) {
        if (user == null) {
            throw new IllegalArgumentException("Sessão inválida ou expirada. Faça login novamente.");
        }

        Product product = Product.findById(dto.productId());
        if (product == null) {
            throw new ResourceNotFoundException("Produto com ID " + dto.productId() + " não encontrado.");
        }

        BigDecimal pPrice = resolvePurchasePrice(dto.purchasePrice(), dto.sellingPrice());

        ProductBatch batch = new ProductBatch();
        batch.product = product;
        batch.quantity = dto.quantity();
        batch.purchaseDate = dto.purchaseDate() != null ? dto.purchaseDate() : LocalDate.now();
        batch.expirationDate = dto.expirationDate();
        batch.purchasePrice = pPrice;
        batch.sellingPrice = dto.sellingPrice();
        batch.user = user;
        batch.persist();

        ProductBatch.getEntityManager().flush();
        ProductBatch.getEntityManager().clear();

        return ProductBatchResponseDTO.fromEntity(batch);
    }

    @Transactional
    public ProductBatchResponseDTO updateBatch(UUID id, ProductBatchRequestDTO dto, User user) {
        if (user == null) {
            throw new IllegalArgumentException("Sessão inválida ou expirada. Faça login novamente.");
        }

        // Check if updating Lote 1 (id == product.id)
        Product product = Product.findById(id);
        if (product != null && product.user.id.equals(user.id)) {
            BigDecimal pPrice = resolvePurchasePrice(dto.purchasePrice(), dto.sellingPrice());
            product.quantity = dto.quantity();
            product.purchaseDate = dto.purchaseDate() != null ? dto.purchaseDate() : LocalDate.now();
            product.expirationDate = dto.expirationDate();
            product.purchasePrice = pPrice;
            product.sellingPrice = dto.sellingPrice();
            product.persist();

            Product.getEntityManager().flush();
            Product.getEntityManager().clear();

            return new ProductBatchResponseDTO(
                product.id,
                product.id,
                product.name,
                product.quantity,
                product.purchaseDate,
                product.expirationDate,
                product.purchasePrice,
                product.sellingPrice
            );
        }

        // Else check if updating Lote 2+ (in product_batches)
        ProductBatch batch = ProductBatch.findById(id);
        if (batch != null && batch.user.id.equals(user.id)) {
            BigDecimal pPrice = resolvePurchasePrice(dto.purchasePrice(), dto.sellingPrice());
            batch.quantity = dto.quantity();
            batch.purchaseDate = dto.purchaseDate() != null ? dto.purchaseDate() : LocalDate.now();
            batch.expirationDate = dto.expirationDate();
            batch.purchasePrice = pPrice;
            batch.sellingPrice = dto.sellingPrice();
            batch.persist();

            ProductBatch.getEntityManager().flush();
            ProductBatch.getEntityManager().clear();

            return ProductBatchResponseDTO.fromEntity(batch);
        }

        throw new ResourceNotFoundException("Lote com ID " + id + " não encontrado.");
    }

    @Transactional
    public void deleteBatch(UUID id, User user) {
        if (user == null) {
            throw new IllegalArgumentException("Sessão inválida ou expirada. Faça login novamente.");
        }

        // Check if deleting Lote 2+ (in product_batches)
        ProductBatch batch = ProductBatch.findById(id);
        if (batch != null && batch.user.id.equals(user.id)) {
            batch.delete();
            ProductBatch.getEntityManager().flush();
            ProductBatch.getEntityManager().clear();
            return;
        }

        // Check if deleting Lote 1 (id == product.id)
        Product product = Product.findById(id);
        if (product != null && product.user.id.equals(user.id)) {
            List<ProductBatch> extraBatches = ProductBatch.findByProductAndUser(product, user);
            if (extraBatches != null && !extraBatches.isEmpty()) {
                // Promote oldest extra batch to Lote 1 on Product entity
                ProductBatch oldestExtra = extraBatches.get(0);
                product.quantity = oldestExtra.quantity;
                product.purchaseDate = oldestExtra.purchaseDate;
                product.expirationDate = oldestExtra.expirationDate;
                product.purchasePrice = oldestExtra.purchasePrice;
                product.sellingPrice = oldestExtra.sellingPrice;
                oldestExtra.delete();
                product.persist();
            } else {
                // No extra batches, delete the entire product
                SaleItem.update("product = null WHERE product.id = ?1", product.id);
                product.delete();
            }
            Product.getEntityManager().flush();
            Product.getEntityManager().clear();
            return;
        }

        throw new ResourceNotFoundException("Lote com ID " + id + " não encontrado.");
    }

    public List<ProductBatchResponseDTO> findByProduct(UUID productId, User user) {
        if (user == null || productId == null) return List.of();
        Product product = Product.findById(productId);
        if (product == null) return List.of();

        ProductBatchResponseDTO lote1 = new ProductBatchResponseDTO(
            product.id,
            product.id,
            product.name,
            product.quantity != null ? product.quantity : 0,
            product.purchaseDate != null ? product.purchaseDate : LocalDate.now(),
            product.expirationDate,
            product.purchasePrice != null ? product.purchasePrice : BigDecimal.ZERO,
            product.sellingPrice != null ? product.sellingPrice : BigDecimal.ZERO
        );

        List<ProductBatchResponseDTO> extraBatches = ProductBatch.findByProductAndUser(product, user)
                .stream()
                .map(ProductBatchResponseDTO::fromEntity)
                .toList();

        List<ProductBatchResponseDTO> allBatches = new ArrayList<>();
        allBatches.add(lote1);
        allBatches.addAll(extraBatches);

        allBatches.sort(Comparator.comparing(
            (ProductBatchResponseDTO b) -> b.expirationDate() == null ? LocalDate.MAX : b.expirationDate()
        ).thenComparing(b -> b.purchaseDate() != null ? b.purchaseDate() : LocalDate.MIN));

        return allBatches;
    }

    public List<ProductBatchResponseDTO> listAll(User user) {
        if (user == null) return List.of();
        List<Product> products = Product.listAllWithRelations(user);
        List<ProductBatchResponseDTO> result = new ArrayList<>();
        for (Product product : products) {
            ProductBatchResponseDTO lote1 = new ProductBatchResponseDTO(
                product.id,
                product.id,
                product.name,
                product.quantity != null ? product.quantity : 0,
                product.purchaseDate != null ? product.purchaseDate : LocalDate.now(),
                product.expirationDate,
                product.purchasePrice != null ? product.purchasePrice : BigDecimal.ZERO,
                product.sellingPrice != null ? product.sellingPrice : BigDecimal.ZERO
            );
            result.add(lote1);

            if (product.batches != null) {
                for (ProductBatch b : product.batches) {
                    result.add(ProductBatchResponseDTO.fromEntity(b));
                }
            }
        }

        result.sort(Comparator.comparing(
            (ProductBatchResponseDTO b) -> b.expirationDate() == null ? LocalDate.MAX : b.expirationDate()
        ).thenComparing(b -> b.purchaseDate() != null ? b.purchaseDate() : LocalDate.MIN));

        return result;
    }
}
