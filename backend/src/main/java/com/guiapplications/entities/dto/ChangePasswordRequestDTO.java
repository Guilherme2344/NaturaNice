package com.guiapplications.entities.dto;

import java.util.UUID;

public record ChangePasswordRequestDTO(
    UUID userId,
    String newPassword
) {}
