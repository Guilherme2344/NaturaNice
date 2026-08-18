package com.guiapplications.entities.dto;

public record CreateUserResponseDTO(
    UserResponseDTO user,
    String generatedPassword
) {}
