package com.guiapplications.entities.dto;

import java.util.UUID;
import com.guiapplications.entities.Family;

public record FamilyResponseDTO(
    UUID id,
    String name,
    BrandResponseDTO brand,
    boolean canDelete
) {
    public static FamilyResponseDTO fromEntity(Family family, boolean canDelete) {
        BrandResponseDTO brandDto = family.brand != null ? BrandResponseDTO.fromEntity(family.brand) : null;
        return new FamilyResponseDTO(
            family.id,
            family.name,
            brandDto,
            canDelete
        );
    }

    public static FamilyResponseDTO fromEntity(Family family) {
        return fromEntity(family, true);
    }
}
