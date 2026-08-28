package com.guiapplications.enums;

public enum SaleStatus {
    PAID("Pago"),
    PARTIALLY_PAID("Parcialmente Pago");

    private final String description;

    SaleStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
