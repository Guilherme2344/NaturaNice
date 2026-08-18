package com.guiapplications.services;

import java.time.LocalDate;
import java.util.List;

import com.guiapplications.entities.Brand;
import com.guiapplications.entities.Category;
import com.guiapplications.entities.Family;
import com.guiapplications.entities.Product;
import com.guiapplications.entities.User;
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
        return create(dto, null);
    }

	@Transactional
    public ProductResponseDTO create(ProductRequestDTO dto, Long userId) {
		String trimmedName = dto.name().trim();

        User user = userId != null ? User.findById(userId) : null;
		
		// check if already exists the typed name for this user
		long duplicateCount;
        if (user != null) {
            duplicateCount = Product.count("unaccent(LOWER(name)) = unaccent(LOWER(?1)) AND (user = ?2 OR user IS NULL)", trimmedName, user);
        } else {
            duplicateCount = Product.count("unaccent(LOWER(name)) = unaccent(LOWER(?1))", trimmedName);
        }

		if (duplicateCount > 0) {
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
        product.name = trimmedName;
        product.quantity = dto.quantity();
        product.expirationDate = dto.expirationDate();
        product.purchasePrice = dto.purchasePrice();
        product.sellingPrice = dto.sellingPrice();
        product.brand = brand;
        product.category = category;
        product.family = family;
        product.user = user;

        product.persist();

        return ProductResponseDTO.fromEntity(product);
    }
	
	// list all products
	public List<ProductResponseDTO> listAll(Long userId) {
        User user = userId != null ? User.findById(userId) : null;
		List<Product> products = Product.listAllWithRelations(user);
		return products.stream()
				.map(ProductResponseDTO::fromEntity)
				.toList();
	}
	
	// search products by any criterion
	public List<ProductResponseDTO> searchProducts(
            String query, String familyName, String brandName, String categoryName, LocalDate maxExpDate, Long userId
    ) {
        User user = userId != null ? User.findById(userId) : null;
        List<Product> products = Product.findWithFilters(query, familyName, brandName, categoryName, maxExpDate, user);
        return products.stream()
                .map(ProductResponseDTO::fromEntity)
                .toList();
    }
	
	// list all expired products
	public List<ProductResponseDTO> findExpired(Long userId) {
        User user = userId != null ? User.findById(userId) : null;
	    return Product.findExpired(user)
	            .stream()
	            .map(ProductResponseDTO::fromEntity)
	            .toList();
	}

	// list all near expiration products
	public List<ProductResponseDTO> findNearExpiration(Long userId) {
        User user = userId != null ? User.findById(userId) : null;
	    return Product.findNearExpiration(user)
	            .stream()
	            .map(ProductResponseDTO::fromEntity)
	            .toList();
	}
	
	// update a product
	@Transactional
    public ProductResponseDTO update(Long id, ProductRequestDTO dto) {
        Product product = Product.findById(id);
        if (product == null) {
            throw new ResourceNotFoundException("Produto com ID " + id + " não encontrado.");
        }

        String trimmedName = dto.name().trim();

        // check if there are duplicated names
        long duplicateCount = Product.count(
            "unaccent(LOWER(name)) = unaccent(LOWER(?1)) AND id != ?2", 
            trimmedName, id
        );
        if (duplicateCount > 0) {
            throw new ResourceAlreadyExistsException("Já existe outro produto cadastrado com o nome: " + trimmedName);
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

        // update data
        product.name = trimmedName;
        product.quantity = dto.quantity();
        product.expirationDate = dto.expirationDate();
        product.purchasePrice = dto.purchasePrice();
        product.sellingPrice = dto.sellingPrice();
        product.brand = brand;
        product.category = category;
        product.family = family;

        return ProductResponseDTO.fromEntity(product);
    }
	
	@Transactional
    public void delete(Long id) {
        Product product = Product.findById(id);
        
        if (product == null) {
            throw new ResourceNotFoundException("Produto com ID " + id + " não encontrado.");
        }

        com.guiapplications.entities.SaleItem.update("product = null WHERE product.id = ?1", id);
        product.delete();
    }
}
