package com.guiapplications.services;

import java.util.List;

import com.guiapplications.entities.Family;
import com.guiapplications.entities.dto.FamilyResponseDTO;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class FamilyService {
	
	public List<FamilyResponseDTO> listAll(){
		List<Family> families = Family.listAll();
		return families.stream()
				.map(FamilyResponseDTO::fromEntity)
				.toList();
	}
}
