package com.guiapplications.services;

import java.util.List;

import com.guiapplications.entities.Category;
import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.CategoryRequestDTO;
import com.guiapplications.entities.dto.CategoryResponseDTO;
import com.guiapplications.exceptions.ResourceAlreadyExistsException;
import com.guiapplications.exceptions.ResourceInUseException;
import com.guiapplications.exceptions.ResourceNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.PersistenceException;
import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolationException;

@ApplicationScoped
public class CategoryService {
	
	@Transactional
	public CategoryResponseDTO create(CategoryRequestDTO dto) {
		return create(dto, null);
	}

	// create a Category
	@Transactional
	public CategoryResponseDTO create(CategoryRequestDTO dto, Long userId) {
		String trimmedName = dto.name().trim();
		User user = userId != null ? User.findById(userId) : null;

		// check if already exists the typed name for this user
        List<Category> existing = Category.findByNameAndUser(trimmedName, user);
        if (!existing.isEmpty()) {
            throw new ResourceAlreadyExistsException("Já existe uma categoria cadastrada com o nome: " + trimmedName);
        }
		
		Category category = new Category();
		category.name = trimmedName;
		category.user = user;
		category.persist();
		return CategoryResponseDTO.fromEntity(category);
	}
	
	// list all categories
	public List<CategoryResponseDTO> listAll(Long userId){
		User user = userId != null ? User.findById(userId) : null;
		List<Category> categories = Category.listByUser(user);
		return categories.stream()
				.map(CategoryResponseDTO::fromEntity)
				.toList();
	}

	public List<CategoryResponseDTO> search(String name, Long userId){
		User user = userId != null ? User.findById(userId) : null;
		List<Category> categories = Category.findByNameAndUser(name, user);
		return categories.stream()
				.map(CategoryResponseDTO::fromEntity)
				.toList();
	}
	
	@Transactional
    public CategoryResponseDTO update(Long id, CategoryRequestDTO dto) {
        Category category = Category.findById(id);
        if (category == null) {
            throw new ResourceNotFoundException("Categoria com ID " + id + " não encontrada.");
        }

        String trimmedName = dto.name().trim();

        // check if there are duplicated names
        long duplicateCount = Category.count(
            "unaccent(LOWER(name)) = unaccent(LOWER(?1)) AND id != ?2", 
            trimmedName, id
        );
        if (duplicateCount > 0) {
            throw new ResourceAlreadyExistsException("Já existe outra categoria cadastrada com o nome: " + trimmedName);
        }

        category.name = trimmedName;
        return CategoryResponseDTO.fromEntity(category);
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
