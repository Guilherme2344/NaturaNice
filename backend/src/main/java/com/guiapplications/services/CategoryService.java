package com.guiapplications.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.guiapplications.entities.Category;
import com.guiapplications.entities.Product;
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

	// create a Category
	@Transactional
	public CategoryResponseDTO create(CategoryRequestDTO dto, User user) {
		if (user == null) {
			throw new IllegalArgumentException("Sessão inválida ou expirada. Faça login novamente.");
		}
		String trimmedName = dto.name().trim();

		// check if already exists the typed name for this user
        List<Category> existing = Category.findByNameAndUser(trimmedName, user);
        if (!existing.isEmpty()) {
            throw new ResourceAlreadyExistsException("Já existe uma categoria cadastrada com o nome: " + trimmedName);
        }
		
		Category category = new Category();
		category.name = trimmedName;
		category.user = user;
		category.persist();
		return CategoryResponseDTO.fromEntity(category, true);
	}
	
	// list all categories for user (optimized with single bulk count query)
	public List<CategoryResponseDTO> listAll(User user) {
		if (user == null) return List.of();
		List<Category> categories = Category.listByUser(user);
		if (categories.isEmpty()) return List.of();

		List<Object[]> counts = Product.getEntityManager()
				.createQuery("SELECT p.category.id, COUNT(p) FROM Product p WHERE p.user = :user GROUP BY p.category.id", Object[].class)
				.setParameter("user", user)
				.getResultList();

		Map<UUID, Long> productCountsMap = new HashMap<>();
		for (Object[] row : counts) {
			if (row[0] != null) {
				productCountsMap.put((UUID) row[0], (Long) row[1]);
			}
		}

		return categories.stream()
				.map(c -> {
					long count = productCountsMap.getOrDefault(c.id, 0L);
					return CategoryResponseDTO.fromEntity(c, count == 0);
				})
				.toList();
	}

	public List<CategoryResponseDTO> search(String name, User user) {
		if (user == null) return List.of();
		List<Category> categories = Category.findByNameAndUser(name, user);
		if (categories.isEmpty()) return List.of();

		List<Object[]> counts = Product.getEntityManager()
				.createQuery("SELECT p.category.id, COUNT(p) FROM Product p WHERE p.user = :user GROUP BY p.category.id", Object[].class)
				.setParameter("user", user)
				.getResultList();

		Map<UUID, Long> productCountsMap = new HashMap<>();
		for (Object[] row : counts) {
			if (row[0] != null) {
				productCountsMap.put((UUID) row[0], (Long) row[1]);
			}
		}

		return categories.stream()
				.map(c -> {
					long count = productCountsMap.getOrDefault(c.id, 0L);
					return CategoryResponseDTO.fromEntity(c, count == 0);
				})
				.toList();
	}
	
	@Transactional
    public CategoryResponseDTO update(UUID id, CategoryRequestDTO dto) {
        Category category = Category.findById(id);
        if (category == null) {
            throw new ResourceNotFoundException("Categoria com ID " + id + " não encontrada.");
        }

        String trimmedName = dto.name().trim();

        if (category.user != null) {
            long duplicateCount = Category.count(
                "unaccent(LOWER(name)) = unaccent(LOWER(?1)) AND id != ?2 AND user = ?3", 
                trimmedName, id, category.user
            );
            if (duplicateCount > 0) {
                throw new ResourceAlreadyExistsException("Já existe outra categoria cadastrada com o nome: " + trimmedName);
            }
        }

        category.name = trimmedName;
        long count = Product.count("category", category);
        return CategoryResponseDTO.fromEntity(category, count == 0);
    }
	
	// delete category by id
	@Transactional
	public void delete(UUID id) {
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
