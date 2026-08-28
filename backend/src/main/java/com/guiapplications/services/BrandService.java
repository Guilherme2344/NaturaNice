package com.guiapplications.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.guiapplications.entities.Brand;
import com.guiapplications.entities.Product;
import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.BrandRequestDTO;
import com.guiapplications.entities.dto.BrandResponseDTO;
import com.guiapplications.exceptions.ResourceAlreadyExistsException;
import com.guiapplications.exceptions.ResourceInUseException;
import com.guiapplications.exceptions.ResourceNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.PersistenceException;
import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolationException;

@ApplicationScoped
public class BrandService {
	
	@Transactional
	public BrandResponseDTO create(BrandRequestDTO dto, User user) {
		if (user == null) {
			throw new IllegalArgumentException("Sessão inválida ou expirada. Faça login novamente.");
		}
		String trimmedName = dto.name().trim();

        // check if already exists the typed name for this user
        List<Brand> existing = Brand.findByNameAndUser(trimmedName, user);
        if (!existing.isEmpty()) {
            throw new ResourceAlreadyExistsException("Já existe uma marca cadastrada com o nome: " + trimmedName);
        }
		
		Brand brand = new Brand();
		brand.name = trimmedName;
		brand.hexColor = dto.hexColor() != null ? dto.hexColor().toUpperCase() : "#1C7ED6";
		brand.user = user;
		brand.persist();
		return BrandResponseDTO.fromEntity(brand, true);
	}
	
	// list all brands for user (optimized with single bulk count query)
	public List<BrandResponseDTO> listAll(User user) {
		if (user == null) return List.of();
		List<Brand> brands = Brand.listByUser(user);
		if (brands.isEmpty()) return List.of();

		List<Object[]> counts = Product.getEntityManager()
				.createQuery("SELECT p.brand.id, COUNT(p) FROM Product p WHERE p.user = :user GROUP BY p.brand.id", Object[].class)
				.setParameter("user", user)
				.getResultList();

		Map<UUID, Long> productCountsMap = new HashMap<>();
		for (Object[] row : counts) {
			if (row[0] != null) {
				productCountsMap.put((UUID) row[0], (Long) row[1]);
			}
		}

		return brands.stream()
				.map(b -> {
					long count = productCountsMap.getOrDefault(b.id, 0L);
					return BrandResponseDTO.fromEntity(b, count == 0);
				})
				.toList();
	}

	public List<BrandResponseDTO> search(String name, User user) {
		if (user == null) return List.of();
		List<Brand> brands = Brand.findByNameAndUser(name, user);
		if (brands.isEmpty()) return List.of();

		List<Object[]> counts = Product.getEntityManager()
				.createQuery("SELECT p.brand.id, COUNT(p) FROM Product p WHERE p.user = :user GROUP BY p.brand.id", Object[].class)
				.setParameter("user", user)
				.getResultList();

		Map<UUID, Long> productCountsMap = new HashMap<>();
		for (Object[] row : counts) {
			if (row[0] != null) {
				productCountsMap.put((UUID) row[0], (Long) row[1]);
			}
		}

		return brands.stream()
				.map(b -> {
					long count = productCountsMap.getOrDefault(b.id, 0L);
					return BrandResponseDTO.fromEntity(b, count == 0);
				})
				.toList();
	}
	
	// update a brand
	@Transactional
    public BrandResponseDTO update(UUID id, BrandRequestDTO dto) {
        Brand brand = Brand.findById(id);
        if (brand == null) {
            throw new ResourceNotFoundException("Marca com ID " + id + " não encontrada.");
        }

        String trimmedName = dto.name().trim();

        if (brand.user != null) {
            long duplicateCount = Brand.count(
                "unaccent(LOWER(name)) = unaccent(LOWER(?1)) AND id != ?2 AND user = ?3", 
                trimmedName, id, brand.user
            );
            if (duplicateCount > 0) {
                throw new ResourceAlreadyExistsException("Já existe outra marca cadastrada com o nome: " + trimmedName);
            }
        }

        brand.name = trimmedName;
        if (dto.hexColor() != null) {
            brand.hexColor = dto.hexColor().toUpperCase();
        }
        long count = Product.count("brand", brand);
        return BrandResponseDTO.fromEntity(brand, count == 0);
    }
	
	// delete brand by id
	@Transactional
	public void delete(UUID id) {
		Brand brand = Brand.findById(id);
		if (brand == null) {
			throw new ResourceNotFoundException("Marca com ID " + id + " não foi encontrada");
		}
		try {	
			brand.delete();
			Brand.flush();
		}
		catch (ConstraintViolationException | PersistenceException e) {
			throw new ResourceInUseException("Não é possível excluir a marca " + brand.name + " pois existem produtos associados a ela");
		}
	}
}
