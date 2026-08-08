package com.guiapplications.services;

import java.util.List;

import com.guiapplications.entities.Product;
import com.guiapplications.entities.dto.ProductResponseDTO;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ProductService {
	
	public List<ProductResponseDTO> listAll(){
		List<Product> products = Product.listAll();
		return products.stream()
				.map(ProductResponseDTO::fromEntity)
				.toList();
	}
}
