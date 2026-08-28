package com.guiapplications.entities.dto;

import java.util.UUID;

public record UserResponseDTO(
    UUID id,
    String name,
    String email,
    String role,
    boolean firstAccess,
    boolean canDelete
) {
    public UserResponseDTO(UUID id, String name, String email, String role, boolean firstAccess) {
        this(id, name, email, role, firstAccess, true);
    }
}
