package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    boolean canDelete
) {
    public static ProductResponseDTO fromEntity(Product product) {
        ExpirationStatus status = ExpirationStatus.calculate(product.expirationDate);
        BigDecimal profit = (product.sellingPrice != null && product.purchasePrice != null)
                ? product.sellingPrice.subtract(product.purchasePrice)
                : BigDecimal.ZERO;
        
        LocalDate purchaseDate = product.purchaseDate != null ? product.purchaseDate : LocalDate.now();

        return new ProductResponseDTO(
            product.id,
            product.name,
            product.quantity,
            purchaseDate,
            product.expirationDate,
            product.purchasePrice,
            product.sellingPrice,
            profit,
            BrandResponseDTO.fromEntity(product.brand),
            CategoryResponseDTO.fromEntity(product.category),
            FamilyResponseDTO.fromEntity(product.family),
            status,
            status != null ? status.getDescription() : null,
            true
        );
    }
}
