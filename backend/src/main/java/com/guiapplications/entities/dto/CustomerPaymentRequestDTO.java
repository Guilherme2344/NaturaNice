package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import com.guiapplications.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CustomerPaymentRequestDTO(
    @NotNull(message = "O valor do pagamento é obrigatório.")
    @Positive(message = "O valor do pagamento deve ser maior que zero.")
    BigDecimal amount,
    PaymentMethod paymentMethod
) {
    public CustomerPaymentRequestDTO(BigDecimal amount) {
        this(amount, null);
    }
}
