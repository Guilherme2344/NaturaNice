package com.guiapplications.entities.dto;

import jakarta.validation.constraints.NotBlank;

public record TwoFactorVerifyRequestDTO(
    @NotBlank(message = "O e-mail é obrigatório")
    String email,

    @NotBlank(message = "O código 2FA é obrigatório")
    String code
) {}
