package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.guiapplications.entities.Product;

public record ProductResponseDTO(
	    Long id,
	    String name,
	    Integer quantity,
	    LocalDate expirationDate,
	    BigDecimal purchasePrice,
	    BigDecimal sellingPrice,
	    String familyName,
	    String brandName,
	    String categoryName
	) {
	    // converts entity to DTO
	    public static ProductResponseDTO fromEntity(Product product) {
	        return new ProductResponseDTO(
	            product.id,
	            product.name,
	            product.quantity,
	            product.expirationDate,
	            product.purchasePrice,
	            product.sellingPrice,
	            product.family != null ? product.family.name : null,
	            product.brand != null ? product.brand.name : null,
	            product.category != null ? product.category.name : null
	        );
	    }
	}
