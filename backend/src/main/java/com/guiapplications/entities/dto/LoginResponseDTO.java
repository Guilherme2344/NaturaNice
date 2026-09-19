package com.guiapplications.entities.dto;

public record LoginResponseDTO(
    boolean twoFactorRequired,
    String email,
    String token,
    UserResponseDTO user
) {
    public LoginResponseDTO(String token, UserResponseDTO user) {
        this(false, user != null ? user.email() : null, token, user);
    }
}
