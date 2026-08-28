package com.guiapplications.entities.dto;

import java.util.UUID;
import com.guiapplications.entities.Brand;

public record BrandResponseDTO(
    UUID id,
    String name,
    String hexColor,
    boolean canDelete
) {
    public static BrandResponseDTO fromEntity(Brand brand, boolean canDelete) {
        return new BrandResponseDTO(
            brand.id,
            brand.name,
            brand.hexColor,
            canDelete
        );
    }

    public static BrandResponseDTO fromEntity(Brand brand) {
        return fromEntity(brand, true);
    }
}
