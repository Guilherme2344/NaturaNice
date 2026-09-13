package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import com.guiapplications.entities.ProductBatch;

public record ProductBatchResponseDTO(
    UUID id,
    UUID productId,
    String productName,
    Integer quantity,
    LocalDate purchaseDate,
    LocalDate expirationDate,
    BigDecimal purchasePrice,
    BigDecimal sellingPrice
) {
    public static ProductBatchResponseDTO fromEntity(ProductBatch batch) {
        return new ProductBatchResponseDTO(
            batch.id,
            batch.product != null ? batch.product.id : null,
            batch.product != null ? batch.product.name : null,
            batch.quantity,
            batch.purchaseDate,
            batch.expirationDate,
            batch.purchasePrice,
            batch.sellingPrice
        );
    }
}
