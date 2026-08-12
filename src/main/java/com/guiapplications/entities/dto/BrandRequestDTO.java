package com.guiapplications.entities.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record BrandRequestDTO(
		@NotBlank(message = "O nome da marca é obrigatório")
	    @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
	    String name,
	    
	    @NotBlank(message = "A cor da marca é obrigatória.")
	    @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "A cor deve estar em formato HEX válido (ex: #FF5733).")
	    String hexColor
) {}