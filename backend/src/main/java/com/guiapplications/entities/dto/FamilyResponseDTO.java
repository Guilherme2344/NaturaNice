package com.guiapplications.entities.dto;

import java.util.UUID;
import com.guiapplications.entities.Family;

public record FamilyResponseDTO(
    UUID id,
    String name,
    boolean canDelete
) {
    public static FamilyResponseDTO fromEntity(Family family, boolean canDelete) {
        return new FamilyResponseDTO(
            family.id,
            family.name,
            canDelete
        );
    }

    public static FamilyResponseDTO fromEntity(Family family) {
        return fromEntity(family, true);
    }
}
