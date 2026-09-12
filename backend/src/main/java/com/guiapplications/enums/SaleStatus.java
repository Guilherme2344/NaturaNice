package com.guiapplications.enums;

import java.math.BigDecimal;

public enum SaleStatus {
    PAID("Pago"),
    PARTIALLY_PAID("Parcialmente pago"),
    UNPAID("Não pago");

    private final String description;

    SaleStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public static SaleStatus calculate(BigDecimal amountPaid, BigDecimal totalAmount) {
        if (amountPaid == null || amountPaid.compareTo(BigDecimal.ZERO) <= 0) {
            return UNPAID;
        }
        if (totalAmount != null && amountPaid.compareTo(totalAmount) >= 0) {
            return PAID;
        }
        return PARTIALLY_PAID;
    }
}
