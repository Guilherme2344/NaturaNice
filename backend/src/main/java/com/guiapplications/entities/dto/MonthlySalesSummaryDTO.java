package com.guiapplications.entities.dto;

import java.math.BigDecimal;

public record MonthlySalesSummaryDTO(
    int month,
    BigDecimal revenue,
    BigDecimal cost,
    BigDecimal profit,
    long itemsSold
) {
    public MonthlySalesSummaryDTO(int month, Number revenue, Number cost, Number profit, Number itemsSold) {
        this(
            month,
            revenue != null ? (revenue instanceof BigDecimal bd ? bd : BigDecimal.valueOf(revenue.doubleValue())) : BigDecimal.ZERO,
            cost != null ? (cost instanceof BigDecimal bd ? bd : BigDecimal.valueOf(cost.doubleValue())) : BigDecimal.ZERO,
            profit != null ? (profit instanceof BigDecimal bd ? bd : BigDecimal.valueOf(profit.doubleValue())) : BigDecimal.ZERO,
            itemsSold != null ? itemsSold.longValue() : 0L
        );
    }
}