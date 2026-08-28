package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CustomerPurchaseItemDTO(
    UUID saleId,
    LocalDateTime saleDate,
    String productName,
    Integer quantity,
    BigDecimal unitSellingPrice,
    BigDecimal totalAmount,
    BigDecimal amountPaid,
    BigDecimal remainingAmount,
    String status,
    String statusDescription,
    List<SalePaymentDTO> payments
) {}
