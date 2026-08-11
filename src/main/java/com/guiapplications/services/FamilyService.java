package com.guiapplications.services;

import java.util.List;

import com.guiapplications.entities.Family;
import com.guiapplications.entities.dto.FamilyResponseDTO;
import com.guiapplications.exceptions.ResourceInUseException;
import com.guiapplications.exceptions.ResourceNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.PersistenceException;
import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolationException;

@ApplicationScoped
public class FamilyService {
	
	// list all families
	public List<FamilyResponseDTO> listAll(){
		List<Family> families = Family.listAll();
		return families.stream()
				.map(FamilyResponseDTO::fromEntity)
				.toList();
	}
	
	// delete family by id
	@Transactional
	public void delete(Long id) {
		Family family = Family.findById(id);
		if (family == null) {
			throw new ResourceNotFoundException("Familia com ID " + id + " não foi encontrada");
		}
		try {
			family.delete();
			Family.flush();
		}
		catch (ConstraintViolationException | PersistenceException e) {
			throw new ResourceInUseException("Não é possível excluir a familia " + family.name + " pois existem produtos associados a ela");
		}
	}
}
