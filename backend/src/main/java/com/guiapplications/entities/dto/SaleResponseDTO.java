package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record SaleResponseDTO(
    UUID saleId,
    LocalDateTime saleDate,
    UUID productId,
    String productName,
    Integer quantity,
    BigDecimal purchasePrice,
    BigDecimal sellingPrice,
    BigDecimal totalAmount,
    BigDecimal amountPaid,
    BigDecimal remainingAmount,
    BigDecimal totalProfit,
    String status,
    String statusDescription,
    String customerName,
    String observation,
    Boolean isPersonalUse,
    String paymentMethod,
    String paymentMethodDescription,
    BigDecimal discount,
    BigDecimal grossAmount
) {
    public SaleResponseDTO(
        UUID saleId,
        LocalDateTime saleDate,
        UUID productId,
        String productName,
        Integer quantity,
        BigDecimal purchasePrice,
        BigDecimal sellingPrice,
        BigDecimal totalAmount,
        BigDecimal amountPaid,
        BigDecimal remainingAmount,
        BigDecimal totalProfit,
        String status,
        String statusDescription,
        String customerName,
        String observation,
        Boolean isPersonalUse,
        String paymentMethod,
        String paymentMethodDescription
    ) {
        this(saleId, saleDate, productId, productName, quantity, purchasePrice, sellingPrice, totalAmount, amountPaid, remainingAmount, totalProfit, status, statusDescription, customerName, observation, isPersonalUse, paymentMethod, paymentMethodDescription, BigDecimal.ZERO, totalAmount);
    }
}
