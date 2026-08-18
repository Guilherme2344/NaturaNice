package com.guiapplications.entities.dto;

public record LoginResponseDTO(
    String token,
    UserResponseDTO user
) {}
