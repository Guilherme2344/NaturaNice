package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.guiapplications.entities.Product;
import com.guiapplications.enums.ExpirationStatus;

public record ProductResponseDTO(
    UUID id,
    String name,
    Integer quantity,
    LocalDate purchaseDate,
    LocalDate expirationDate,
    BigDecimal purchasePrice,
    BigDecimal sellingPrice,
    BigDecimal profit,
    BrandResponseDTO brand,
    CategoryResponseDTO category,
    FamilyResponseDTO family,
    ExpirationStatus expirationStatus,
    String expirationStatusDescription,
    boolean canDelete,
    List<ProductBatchResponseDTO> batches
) {
    public static ProductResponseDTO fromEntity(Product product) {
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

        List<ProductBatchResponseDTO> extraBatches = (product.batches != null)
                ? product.batches.stream().map(ProductBatchResponseDTO::fromEntity).toList()
                : List.of();

        List<ProductBatchResponseDTO> allBatches = new java.util.ArrayList<>();
        allBatches.add(lote1);
        allBatches.addAll(extraBatches);

        allBatches.sort((b1, b2) -> {
            LocalDate d1 = b1.expirationDate();
            LocalDate d2 = b2.expirationDate();
            if (d1 == null && d2 == null) return 0;
            if (d1 == null) return 1;
            if (d2 == null) return -1;
            return d1.compareTo(d2);
        });

        int totalQuantity = allBatches.stream().mapToInt(b -> b.quantity() != null ? b.quantity() : 0).sum();

        ProductBatchResponseDTO oldest = allBatches.get(0);
        LocalDate effectiveExpDate = oldest.expirationDate();
        BigDecimal effectivePurchasePrice = oldest.purchasePrice();
        BigDecimal effectiveSellingPrice = oldest.sellingPrice();
        LocalDate effectivePurchaseDate = oldest.purchaseDate();

        ExpirationStatus status = ExpirationStatus.calculate(effectiveExpDate);
        BigDecimal profit = (effectiveSellingPrice != null && effectivePurchasePrice != null)
                ? effectiveSellingPrice.subtract(effectivePurchasePrice)
                : BigDecimal.ZERO;

        return new ProductResponseDTO(
            product.id,
            product.name,
            totalQuantity,
            effectivePurchaseDate,
            effectiveExpDate,
            effectivePurchasePrice,
            effectiveSellingPrice,
            profit,
            BrandResponseDTO.fromEntity(product.brand),
            CategoryResponseDTO.fromEntity(product.category),
            FamilyResponseDTO.fromEntity(product.family),
            status,
            status != null ? status.getDescription() : null,
            true,
            allBatches
        );
    }

    public static ProductResponseDTO withFilteredBatches(ProductResponseDTO fullDto, List<ProductBatchResponseDTO> filteredBatches) {
        if (filteredBatches == null || filteredBatches.isEmpty()) {
            return fullDto;
        }
        List<ProductBatchResponseDTO> sorted = new java.util.ArrayList<>(filteredBatches);
        sorted.sort((b1, b2) -> {
            LocalDate d1 = b1.expirationDate();
            LocalDate d2 = b2.expirationDate();
            if (d1 == null && d2 == null) return 0;
            if (d1 == null) return 1;
            if (d2 == null) return -1;
            return d1.compareTo(d2);
        });

        int totalQuantity = sorted.stream().mapToInt(b -> b.quantity() != null ? b.quantity() : 0).sum();

        ProductBatchResponseDTO oldest = sorted.get(0);
        LocalDate effectiveExpDate = oldest.expirationDate();
        BigDecimal effectivePurchasePrice = oldest.purchasePrice();
        BigDecimal effectiveSellingPrice = oldest.sellingPrice();
        LocalDate effectivePurchaseDate = oldest.purchaseDate();

        ExpirationStatus status = ExpirationStatus.calculate(effectiveExpDate);
        BigDecimal profit = (effectiveSellingPrice != null && effectivePurchasePrice != null)
                ? effectiveSellingPrice.subtract(effectivePurchasePrice)
                : BigDecimal.ZERO;

        return new ProductResponseDTO(
            fullDto.id(),
            fullDto.name(),
            totalQuantity,
            effectivePurchaseDate,
            effectiveExpDate,
            effectivePurchasePrice,
            effectiveSellingPrice,
            profit,
            fullDto.brand(),
            fullDto.category(),
            fullDto.family(),
            status,
            status != null ? status.getDescription() : null,
            fullDto.canDelete(),
            sorted
        );
    }
}
