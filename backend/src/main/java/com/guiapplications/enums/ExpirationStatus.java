package com.guiapplications.enums;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public enum ExpirationStatus {
    FAR_FROM_EXPIRING("Longe de vencer"),
    NEAR_EXPIRATION("Perto de vencer"),
    EXPIRED("Vencido");

    private final String description;

    ExpirationStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    // isolated business rule
    public static ExpirationStatus calculate(LocalDate expirationDate) {
        if (expirationDate == null) {
            return null;
        }

        long daysUntilExpiration = ChronoUnit.DAYS.between(LocalDate.now(), expirationDate);

        if (daysUntilExpiration <= 0) {
            return EXPIRED;
        } else if (daysUntilExpiration <= 180) {
            return NEAR_EXPIRATION;
        } else {
            return FAR_FROM_EXPIRING;
        }
    }
}