package com.guiapplications.services;

import java.util.List;

import com.guiapplications.entities.Family;
import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.FamilyRequestDTO;
import com.guiapplications.entities.dto.FamilyResponseDTO;
import com.guiapplications.exceptions.ResourceAlreadyExistsException;
import com.guiapplications.exceptions.ResourceInUseException;
import com.guiapplications.exceptions.ResourceNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.PersistenceException;
import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolationException;

@ApplicationScoped
public class FamilyService {
	
	@Transactional
	public FamilyResponseDTO create(FamilyRequestDTO dto) {
		return create(dto, null);
	}

	// create a Family
	@Transactional
	public FamilyResponseDTO create(FamilyRequestDTO dto, Long userId) {
		String trimmedName = dto.name().trim();
		User user = userId != null ? User.findById(userId) : null;
		
		// check if already exists the typed name for this user
        List<Family> existing = Family.findByNameAndUser(trimmedName, user);
        if (!existing.isEmpty()) {
            throw new ResourceAlreadyExistsException("Já existe uma família cadastrada com o nome: " + trimmedName);
        }
		
		Family family = new Family();
		family.name = trimmedName;
		family.user = user;
		family.persist();
		return FamilyResponseDTO.fromEntity(family);
	}
	
	// list all families
	public List<FamilyResponseDTO> listAll(Long userId){
		User user = userId != null ? User.findById(userId) : null;
		List<Family> families = Family.listByUser(user);
		return families.stream()
				.map(FamilyResponseDTO::fromEntity)
				.toList();
	}

	public List<FamilyResponseDTO> search(String name, Long userId){
		User user = userId != null ? User.findById(userId) : null;
		List<Family> families = Family.findByNameAndUser(name, user);
		return families.stream()
				.map(FamilyResponseDTO::fromEntity)
				.toList();
	}
	
	// update a family
	@Transactional
    public FamilyResponseDTO update(Long id, FamilyRequestDTO dto) {
        Family family = Family.findById(id);
        if (family == null) {
            throw new ResourceNotFoundException("Família com ID " + id + " não encontrada.");
        }

        String trimmedName = dto.name().trim();

        // check if there are duplicated names
        long duplicateCount = Family.count(
            "unaccent(LOWER(name)) = unaccent(LOWER(?1)) AND id != ?2", 
            trimmedName, id
        );
        if (duplicateCount > 0) {
            throw new ResourceAlreadyExistsException("Já existe outra família cadastrada com o nome: " + trimmedName);
        }

        family.name = trimmedName;
        return FamilyResponseDTO.fromEntity(family);
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
