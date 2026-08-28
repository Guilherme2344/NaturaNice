package com.guiapplications.entities.dto;

import java.util.UUID;
import com.guiapplications.entities.Category;

public record CategoryResponseDTO(
    UUID id,
    String name,
    boolean canDelete
) {
    public static CategoryResponseDTO fromEntity(Category category, boolean canDelete) {
        return new CategoryResponseDTO(
            category.id,
            category.name,
            canDelete
        );
    }

    public static CategoryResponseDTO fromEntity(Category category) {
        return fromEntity(category, true);
    }
}
