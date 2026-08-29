package com.guiapplications.entities.dto;

import java.math.BigDecimal;

public record MonthlySalesSummaryDTO(
    int month,
    BigDecimal revenue,
    BigDecimal cost,
    BigDecimal profit,
    long itemsSold
) {}