package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record SaleItemRequestDTO(
    UUID productId,
    UUID batchId,
    Integer quantity,
    BigDecimal sellingPrice
) {
    public SaleItemRequestDTO(UUID productId, Integer quantity, BigDecimal sellingPrice) {
        this(productId, null, quantity, sellingPrice);
    }
}
