package com.guiapplications.entities.dto;

import com.guiapplications.entities.Family;

public record FamilyResponseDTO(
	    String name
	) {
	    // converts entity to DTO
	    public static FamilyResponseDTO fromEntity(Family family) {
	        return new FamilyResponseDTO(
	            family.name
	        );
	    }
	}
