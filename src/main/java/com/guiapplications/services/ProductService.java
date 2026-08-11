package com.guiapplications.services;

import java.time.LocalDate;
import java.util.List;

import com.guiapplications.entities.Product;
import com.guiapplications.entities.dto.ProductResponseDTO;
import com.guiapplications.exceptions.ResourceNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class ProductService {
	
	// list all products
	public List<ProductResponseDTO> listAll(){
		List<Product> products = Product.listAll();
		return products.stream()
				.map(ProductResponseDTO::fromEntity)
				.toList();
	}
	
	// search products by any criterion below
	public List<ProductResponseDTO> searchProducts(
            String query, String familyName, String brandName, String categoryName, LocalDate maxExpDate
    ) {
        List<Product> products = Product.findWithFilters(query, familyName, brandName, categoryName, maxExpDate);
        return products.stream()
                .map(ProductResponseDTO::fromEntity)
                .toList();
    }
	
	@Transactional
    public void delete(Long id) {
        Product product = Product.findById(id);
        
        if (product == null) {
            throw new ResourceNotFoundException("Produto com ID " + id + " não encontrado.");
        }

        product.delete();
    }
}
