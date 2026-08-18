package com.guiapplications.entities.dto;

import java.math.BigDecimal;

public record SaleRequestDTO(
    Long productId,
    Integer quantity,
    BigDecimal sellingPrice,
    String customerName
) {}
