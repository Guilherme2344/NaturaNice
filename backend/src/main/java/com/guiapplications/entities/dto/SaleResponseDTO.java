package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SaleResponseDTO(
    Long saleId,
    LocalDateTime saleDate,
    Long productId,
    String productName,
    Integer quantity,
    BigDecimal purchasePrice,
    BigDecimal sellingPrice,
    BigDecimal totalAmount,
    BigDecimal totalProfit,
    String customerName
) {}
