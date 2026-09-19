package com.guiapplications.enums;

public enum PaymentMethod {
    CARD("Cartão"),
    CASH("Dinheiro"),
    PIX("Pix");

    private final String description;

    PaymentMethod(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
