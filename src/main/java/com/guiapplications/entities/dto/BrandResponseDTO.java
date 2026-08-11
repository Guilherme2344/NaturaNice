package com.guiapplications.entities.dto;

import com.guiapplications.entities.Brand;

public record BrandResponseDTO(
		Long id,
	    String name
	) {
	    // converts entity to DTO
	    public static BrandResponseDTO fromEntity(Brand brand) {
	        return new BrandResponseDTO(
	        	brand.id,
	            brand.name
	        );
	    }
	}
