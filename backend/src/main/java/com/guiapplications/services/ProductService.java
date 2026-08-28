package com.guiapplications.services;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.guiapplications.entities.Brand;
import com.guiapplications.entities.Category;
import com.guiapplications.entities.Family;
import com.guiapplications.entities.Product;
import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.ProductRequestDTO;
import com.guiapplications.entities.dto.ProductResponseDTO;
import com.guiapplications.exceptions.ResourceNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class ProductService {

    // Helper method to resolve or auto-create Brand
    private Brand resolveBrand(UUID brandId, String brandName, User user) {
        if (brandId != null) {
            Brand b = Brand.findById(brandId);
            if (b != null) return b;
        }
        if (brandName != null && !brandName.isBlank()) {
            String trimmed = brandName.trim();
            List<Brand> existing = Brand.findByNameAndUser(trimmed, user);
            if (!existing.isEmpty()) {
                return existing.get(0);
            }
            Brand newBrand = new Brand();
            newBrand.name = trimmed;
            newBrand.hexColor = "#1C7ED6";
            newBrand.user = user;
            newBrand.persist();
            return newBrand;
        }
        throw new IllegalArgumentException("A marca do produto é obrigatória.");
    }

    // Helper method to resolve or auto-create Category
    private Category resolveCategory(UUID categoryId, String categoryName, User user) {
        if (categoryId != null) {
            Category c = Category.findById(categoryId);
            if (c != null) return c;
        }
        if (categoryName != null && !categoryName.isBlank()) {
            String trimmed = categoryName.trim();
            List<Category> existing = Category.findByNameAndUser(trimmed, user);
            if (!existing.isEmpty()) {
                return existing.get(0);
            }
            Category newCategory = new Category();
            newCategory.name = trimmed;
            newCategory.user = user;
            newCategory.persist();
            return newCategory;
        }
        throw new IllegalArgumentException("A categoria do produto é obrigatória.");
    }

    // Helper method to resolve or auto-create Family
    private Family resolveFamily(UUID familyId, String familyName, User user) {
        if (familyId != null) {
            Family f = Family.findById(familyId);
            if (f != null) return f;
        }
        if (familyName != null && !familyName.isBlank()) {
            String trimmed = familyName.trim();
            List<Family> existing = Family.findByNameAndUser(trimmed, user);
            if (!existing.isEmpty()) {
                return existing.get(0);
            }
            Family newFamily = new Family();
            newFamily.name = trimmed;
            newFamily.user = user;
            newFamily.persist();
            return newFamily;
        }
        throw new IllegalArgumentException("A família do produto é obrigatória.");
    }

    // create a product
    @Transactional
    public ProductResponseDTO create(ProductRequestDTO dto, User user) {
        if (user == null) {
            throw new IllegalArgumentException("Sessão inválida ou expirada. Faça login novamente.");
        }
        String trimmedName = dto.name().trim();

        Brand brand = resolveBrand(dto.brandId(), dto.brandName(), user);
        Category category = resolveCategory(dto.categoryId(), dto.categoryName(), user);
        Family family = resolveFamily(dto.familyId(), dto.familyName(), user);

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

    // list all products for user
    public List<ProductResponseDTO> listAll(User user) {
        if (user == null) return List.of();
        List<Product> products = Product.listAllWithRelations(user);
        return products.stream()
                .map(ProductResponseDTO::fromEntity)
                .toList();
    }

    // search products by any criterion
    public List<ProductResponseDTO> searchProducts(
            String query, String familyName, String brandName, String categoryName, LocalDate maxExpDate, User user
    ) {
        if (user == null) return List.of();
        List<Product> products = Product.findWithFilters(query, familyName, brandName, categoryName, maxExpDate, user);
        return products.stream()
                .map(ProductResponseDTO::fromEntity)
                .toList();
    }

    // list all expired products
    public List<ProductResponseDTO> findExpired(User user) {
        if (user == null) return List.of();
        return Product.findExpired(user)
                .stream()
                .map(ProductResponseDTO::fromEntity)
                .toList();
    }

    // list all near expiration products
    public List<ProductResponseDTO> findNearExpiration(User user) {
        if (user == null) return List.of();
        return Product.findNearExpiration(user)
                .stream()
                .map(ProductResponseDTO::fromEntity)
                .toList();
    }

    // update a product
    @Transactional
    public ProductResponseDTO update(UUID id, ProductRequestDTO dto) {
        Product product = Product.findById(id);
        if (product == null) {
            throw new ResourceNotFoundException("Produto com ID " + id + " não encontrado.");
        }

        String trimmedName = dto.name().trim();
        User user = product.user;

        Brand brand = resolveBrand(dto.brandId(), dto.brandName(), user);
        Category category = resolveCategory(dto.categoryId(), dto.categoryName(), user);
        Family family = resolveFamily(dto.familyId(), dto.familyName(), user);

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
    public void delete(UUID id) {
        Product product = Product.findById(id);

        if (product == null) {
            throw new ResourceNotFoundException("Produto com ID " + id + " não encontrado.");
        }

        com.guiapplications.entities.SaleItem.update("product = null WHERE product.id = ?1", id);
        product.delete();
    }
}
