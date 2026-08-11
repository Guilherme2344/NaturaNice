package com.guiapplications.services;

import java.time.LocalDate;
import java.util.List;

import com.guiapplications.entities.Brand;
import com.guiapplications.entities.Category;
import com.guiapplications.entities.Family;
import com.guiapplications.entities.Product;
import com.guiapplications.entities.dto.ProductRequestDTO;
import com.guiapplications.entities.dto.ProductResponseDTO;
import com.guiapplications.exceptions.ResourceAlreadyExistsException;
import com.guiapplications.exceptions.ResourceNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class ProductService {
	
	// create a product
	@Transactional
    public ProductResponseDTO create(ProductRequestDTO dto) {
		String trimmedName = dto.name().trim();
		
		// check if already exists the typed name
		if (Product.count("unaccent(LOWER(name)) = unaccent(LOWER(?1))", trimmedName) > 0) {
			throw new ResourceAlreadyExistsException("Já existe um produto cadastrado com o nome: " + trimmedName);
		}
		
        Brand brand = Brand.findById(dto.brandId());
        if (brand == null) {
            throw new ResourceNotFoundException("Marca não encontrada com o ID: " + dto.brandId());
        }

        Category category = Category.findById(dto.categoryId());
        if (category == null) {
            throw new ResourceNotFoundException("Categoria não encontrada com o ID: " + dto.categoryId());
        }

        Family family = Family.findById(dto.familyId());
        if (family == null) {
            throw new ResourceNotFoundException("Família não encontrada com o ID: " + dto.familyId());
        }
        

        Product product = new Product();
        product.name = dto.name();
        product.quantity = dto.quantity();
        product.expirationDate = dto.expirationDate();
        product.purchasePrice = dto.purchasePrice();
        product.sellingPrice = dto.sellingPrice();
        product.brand = brand;
        product.category = category;
        product.family = family;

        product.persist();

        return ProductResponseDTO.fromEntity(product);
    }
	
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
