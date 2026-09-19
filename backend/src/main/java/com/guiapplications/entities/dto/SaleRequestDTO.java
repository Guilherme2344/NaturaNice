package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.guiapplications.enums.PaymentMethod;

public record SaleRequestDTO(
    UUID productId,
    UUID batchId,
    Integer quantity,
    BigDecimal sellingPrice,
    BigDecimal amountPaid,
    String customerName,
    String observation,
    Boolean isPersonalUse,
    List<SaleItemRequestDTO> items,
    PaymentMethod paymentMethod
) {
    public SaleRequestDTO(
        UUID productId,
        UUID batchId,
        Integer quantity,
        BigDecimal sellingPrice,
        BigDecimal amountPaid,
        String customerName,
        String observation,
        Boolean isPersonalUse,
        List<SaleItemRequestDTO> items
    ) {
        this(productId, batchId, quantity, sellingPrice, amountPaid, customerName, observation, isPersonalUse, items, null);
    }

    public SaleRequestDTO(
        UUID productId,
        UUID batchId,
        Integer quantity,
        BigDecimal sellingPrice,
        BigDecimal amountPaid,
        String customerName,
        String observation,
        Boolean isPersonalUse
    ) {
        this(productId, batchId, quantity, sellingPrice, amountPaid, customerName, observation, isPersonalUse, null, null);
    }

    public SaleRequestDTO(UUID productId, Integer quantity, BigDecimal sellingPrice, String customerName) {
        this(productId, null, quantity, sellingPrice, null, customerName, null, false, null, null);
    }

    public SaleRequestDTO(UUID productId, Integer quantity, BigDecimal sellingPrice, BigDecimal amountPaid, String customerName) {
        this(productId, null, quantity, sellingPrice, amountPaid, customerName, null, false, null, null);
    }
}
