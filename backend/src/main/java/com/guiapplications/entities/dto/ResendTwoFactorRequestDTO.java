package com.guiapplications.entities.dto;

import jakarta.validation.constraints.NotBlank;

public record ResendTwoFactorRequestDTO(
    @NotBlank(message = "O e-mail é obrigatório")
    String email
) {}
