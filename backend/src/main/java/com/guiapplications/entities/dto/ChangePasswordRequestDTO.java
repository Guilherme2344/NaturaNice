package com.guiapplications.entities.dto;

public record ChangePasswordRequestDTO(
    Long userId,
    String newPassword
) {}
