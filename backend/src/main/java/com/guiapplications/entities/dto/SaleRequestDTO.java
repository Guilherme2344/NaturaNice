package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record SaleRequestDTO(
    UUID productId,
    UUID batchId,
    Integer quantity,
    BigDecimal sellingPrice,
    BigDecimal amountPaid,
    String customerName,
    String observation,
    Boolean isPersonalUse
) {
    public SaleRequestDTO(UUID productId, Integer quantity, BigDecimal sellingPrice, String customerName) {
        this(productId, null, quantity, sellingPrice, null, customerName, null, false);
    }

    public SaleRequestDTO(UUID productId, Integer quantity, BigDecimal sellingPrice, BigDecimal amountPaid, String customerName) {
        this(productId, null, quantity, sellingPrice, amountPaid, customerName, null, false);
    }
}
