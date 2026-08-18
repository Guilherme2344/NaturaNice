package com.guiapplications.services;

import java.util.List;

import com.guiapplications.entities.Brand;
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
	public BrandResponseDTO create(BrandRequestDTO dto) {
		return create(dto, null);
	}

	// create a brand
	@Transactional
	public BrandResponseDTO create(BrandRequestDTO dto, Long userId) {
		String trimmedName = dto.name().trim();
		User user = userId != null ? User.findById(userId) : null;

        // check if already exists the typed name for this user
        List<Brand> existing = Brand.findByNameAndUser(trimmedName, user);
        if (!existing.isEmpty()) {
            throw new ResourceAlreadyExistsException("Já existe uma marca cadastrada com o nome: " + trimmedName);
        }
		
		Brand brand = new Brand();
		brand.name = trimmedName;
		brand.hexColor = dto.hexColor().toUpperCase();
		brand.user = user;
		brand.persist();
		return BrandResponseDTO.fromEntity(brand);
	}
	
	// list all brands
	public List<BrandResponseDTO> listAll(Long userId){
		User user = userId != null ? User.findById(userId) : null;
		List<Brand> brands = Brand.listByUser(user);
		return brands.stream()
				.map(BrandResponseDTO::fromEntity)
				.toList();
	}

	public List<BrandResponseDTO> search(String name, Long userId){
		User user = userId != null ? User.findById(userId) : null;
		List<Brand> brands = Brand.findByNameAndUser(name, user);
		return brands.stream()
				.map(BrandResponseDTO::fromEntity)
				.toList();
	}
	
	// update a brand
	@Transactional
    public BrandResponseDTO update(Long id, BrandRequestDTO dto) {
        Brand brand = Brand.findById(id);
        if (brand == null) {
            throw new ResourceNotFoundException("Marca com ID " + id + " não encontrada.");
        }

        String trimmedName = dto.name().trim();

        // check if there are duplicated names
        long duplicateCount = Brand.count(
            "unaccent(LOWER(name)) = unaccent(LOWER(?1)) AND id != ?2", 
            trimmedName, id
        );
        if (duplicateCount > 0) {
            throw new ResourceAlreadyExistsException("Já existe outra marca cadastrada com o nome: " + trimmedName);
        }

        brand.name = trimmedName;
        brand.hexColor = dto.hexColor().toUpperCase();
        return BrandResponseDTO.fromEntity(brand);
    }
	
	// delete brand by id
	@Transactional
	public void delete(Long id) {
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
