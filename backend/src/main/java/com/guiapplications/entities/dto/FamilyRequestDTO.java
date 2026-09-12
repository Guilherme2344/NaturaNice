package com.guiapplications.entities.dto;

import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FamilyRequestDTO(
    @NotBlank(message = "O nome da família é obrigatório")
    @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
    String name,
    UUID brandId,
    String brandName
) {
    public FamilyRequestDTO(String name) {
        this(name, null, null);
    }
}