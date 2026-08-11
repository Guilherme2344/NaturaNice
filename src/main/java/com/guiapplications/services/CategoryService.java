package com.guiapplications.services;

import java.util.List;

import com.guiapplications.entities.Category;
import com.guiapplications.entities.dto.CategoryResponseDTO;
import com.guiapplications.exceptions.ResourceInUseException;
import com.guiapplications.exceptions.ResourceNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.PersistenceException;
import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolationException;

@ApplicationScoped
public class CategoryService {
	
	// list all categories
	public List<CategoryResponseDTO> listAll(){
		List<Category> categories = Category.listAll();
		return categories.stream()
				.map(CategoryResponseDTO::fromEntity)
				.toList();
	}
	
	// delete category by id
	@Transactional
	public void delete(Long id) {
		Category category = Category.findById(id);
		if (category == null) {
			throw new ResourceNotFoundException("Categoria com ID " + id + " não foi encontrada");
		}
		try {
			category.delete();
			Category.flush();
		}
		catch (ConstraintViolationException | PersistenceException e) {
			throw new ResourceInUseException("Não é possível excluir a categoria " + category.name + " pois existem produtos associados a ela");
		}
	}
}
