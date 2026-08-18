package com.guiapplications.entities.dto;

public record UserResponseDTO(
    Long id,
    String name,
    String email,
    String role,
    boolean firstAccess
) {}
