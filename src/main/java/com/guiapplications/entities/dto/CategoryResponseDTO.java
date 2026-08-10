package com.guiapplications.entities.dto;

import com.guiapplications.entities.Category;

public record CategoryResponseDTO(
	    String name
	) {
	    // converts entity to DTO
	    public static CategoryResponseDTO fromEntity(Category category) {
	        return new CategoryResponseDTO(
	            category.name
	        );
	    }
	}
