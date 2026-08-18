package com.guiapplications.entities.dto;

public record ResetPasswordRequestDTO(
    String email,
    String code,
    String newPassword
) {}
