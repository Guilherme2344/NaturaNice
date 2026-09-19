package com.guiapplications.entities.dto;

import java.math.BigDecimal;

public record CustomerSaleProductDTO(
    String productName,
    Integer quantity,
    BigDecimal unitPrice,
    BigDecimal totalPrice
) {}
