package com.guiapplications.services;

import java.util.List;

import com.guiapplications.entities.Brand;
import com.guiapplications.entities.dto.BrandResponseDTO;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class BrandService {
	
	public List<BrandResponseDTO> listAll(){
		List<Brand> brands = Brand.listAll();
		return brands.stream()
				.map(BrandResponseDTO::fromEntity)
				.toList();
	}
}
