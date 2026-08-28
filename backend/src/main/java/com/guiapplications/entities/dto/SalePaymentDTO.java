package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record SalePaymentDTO(
    UUID id,
    LocalDateTime paymentDate,
    BigDecimal amount,
    BigDecimal cumulativePaid,
    BigDecimal remainingToPay
) {}
