package com.guiapplications.services;

import java.util.List;

import com.guiapplications.entities.Brand;
import com.guiapplications.entities.dto.BrandResponseDTO;
import com.guiapplications.exceptions.ResourceInUseException;
import com.guiapplications.exceptions.ResourceNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.PersistenceException;
import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolationException;

@ApplicationScoped
public class BrandService {
	
	// list all brands
	public List<BrandResponseDTO> listAll(){
		List<Brand> brands = Brand.listAll();
		return brands.stream()
				.map(BrandResponseDTO::fromEntity)
				.toList();
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
