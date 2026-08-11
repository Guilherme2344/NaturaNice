package com.guiapplications.entities.dto;

import com.guiapplications.entities.Category;

public record CategoryResponseDTO(
		Long id,
	    String name
	) {
	    // converts entity to DTO
	    public static CategoryResponseDTO fromEntity(Category category) {
	        return new CategoryResponseDTO(
	        	category.id,
	            category.name
	        );
	    }
	}
