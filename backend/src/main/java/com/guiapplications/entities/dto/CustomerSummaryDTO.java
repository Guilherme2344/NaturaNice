package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CustomerSummaryDTO(
    UUID customerId,
    String customerName,
    BigDecimal totalAmount,
    BigDecimal totalPaid,
    BigDecimal totalRemaining,
    List<CustomerPurchaseItemDTO> items
) {}
