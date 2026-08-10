package com.guiapplications.services;

import java.util.List;

import com.guiapplications.entities.Category;
import com.guiapplications.entities.dto.CategoryResponseDTO;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CategoryService {
	
	// list all categories
	public List<CategoryResponseDTO> listAll(){
		List<Category> categories = Category.listAll();
		return categories.stream()
				.map(CategoryResponseDTO::fromEntity)
				.toList();
	}
}
