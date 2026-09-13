package com.guiapplications.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.guiapplications.entities.Brand;
import com.guiapplications.entities.Category;
import com.guiapplications.entities.Family;
import com.guiapplications.entities.Product;
import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.ProductBatchResponseDTO;
import com.guiapplications.entities.dto.ProductRequestDTO;
import com.guiapplications.entities.dto.ProductResponseDTO;
import com.guiapplications.exceptions.ResourceNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class ProductService {

    private BigDecimal resolvePurchasePrice(BigDecimal purchasePrice, BigDecimal sellingPrice) {
        if (purchasePrice == null || purchasePrice.compareTo(BigDecimal.ZERO) == 0) {
            if (sellingPrice != null && sellingPrice.compareTo(BigDecimal.ZERO) > 0) {
                return sellingPrice.multiply(new BigDecimal("0.70")).setScale(2, RoundingMode.HALF_UP);
            }
            return BigDecimal.ZERO;
        }
        return purchasePrice;
    }

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
    private Family resolveFamily(UUID familyId, String familyName, Brand brand, User user) {
        if (familyId != null) {
            Family f = Family.findById(familyId);
            if (f != null) {
                if (f.brand == null && brand != null) {
                    f.brand = brand;
                    f.persist();
                }
                return f;
            }
        }
        if (familyName != null && !familyName.isBlank()) {
            String trimmed = familyName.trim();
            List<Family> existing = Family.findByNameAndBrandAndUser(trimmed, brand, user);
            if (!existing.isEmpty()) {
                return existing.get(0);
            }
            Family newFamily = new Family();
            newFamily.name = trimmed;
            newFamily.brand = brand;
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
        Family family = resolveFamily(dto.familyId(), dto.familyName(), brand, user);

        Product product = new Product();
        product.name = trimmedName;
        product.quantity = dto.quantity();
        product.purchaseDate = dto.purchaseDate() != null ? dto.purchaseDate() : LocalDate.now();
        product.expirationDate = dto.expirationDate();
        product.purchasePrice = resolvePurchasePrice(dto.purchasePrice(), dto.sellingPrice());
        product.sellingPrice = dto.sellingPrice();
        product.brand = brand;
        product.category = category;
        product.family = family;
        product.user = user;

        product.persist();

        return ProductResponseDTO.fromEntity(product);
    }

    @Transactional
    public void syncMissingBatches(User user) {
        if (user == null) return;
        List<Product> products = Product.listAllWithRelations(user);
        boolean changedAny = false;
        for (Product p : products) {
            // Clean up any legacy ProductBatch rows that duplicate Lote 1 exactly
            if (p.batches != null && !p.batches.isEmpty()) {
                List<com.guiapplications.entities.ProductBatch> duplicateLote1 = p.batches.stream()
                    .filter(b -> b.quantity != null && b.quantity.equals(p.quantity)
                              && ((b.expirationDate == null && p.expirationDate == null) || (b.expirationDate != null && b.expirationDate.equals(p.expirationDate)))
                              && ((b.purchasePrice == null && p.purchasePrice == null) || (b.purchasePrice != null && b.purchasePrice.equals(p.purchasePrice)))
                              && ((b.sellingPrice == null && p.sellingPrice == null) || (b.sellingPrice != null && b.sellingPrice.equals(p.sellingPrice))))
                    .toList();
                if (!duplicateLote1.isEmpty()) {
                    // Delete the first duplicate batch (the legacy Lote 1 duplicate)
                    duplicateLote1.get(0).delete();
                    changedAny = true;
                }
            }
        }
        if (changedAny) {
            Product.getEntityManager().flush();
            Product.getEntityManager().clear();
        }
    }

    // list all products for user
    @Transactional
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
    @Transactional
    public List<ProductResponseDTO> findExpired(User user) {
        if (user == null) return List.of();
        LocalDate today = LocalDate.now();
        List<Product> products = Product.findExpired(user);

        List<ProductResponseDTO> result = new ArrayList<>();
        for (Product p : products) {
            ProductResponseDTO fullDto = ProductResponseDTO.fromEntity(p);
            if (fullDto.batches() == null) continue;

            List<ProductBatchResponseDTO> expiredBatches = fullDto.batches().stream()
                .filter(b -> b.expirationDate() == null || !b.expirationDate().isAfter(today))
                .toList();

            if (!expiredBatches.isEmpty()) {
                result.add(ProductResponseDTO.withFilteredBatches(fullDto, expiredBatches));
            }
        }
        return result;
    }

    // list all near expiration products
    @Transactional
    public List<ProductResponseDTO> findNearExpiration(User user) {
        if (user == null) return List.of();
        LocalDate today = LocalDate.now();
        LocalDate hundredEightyDaysFromNow = today.plusDays(180);
        List<Product> products = Product.findNearExpiration(user);

        List<ProductResponseDTO> result = new ArrayList<>();
        for (Product p : products) {
            ProductResponseDTO fullDto = ProductResponseDTO.fromEntity(p);
            if (fullDto.batches() == null) continue;

            List<ProductBatchResponseDTO> nearBatches = fullDto.batches().stream()
                .filter(b -> b.expirationDate() != null && 
                             b.expirationDate().isAfter(today) && 
                             !b.expirationDate().isAfter(hundredEightyDaysFromNow))
                .toList();

            if (!nearBatches.isEmpty()) {
                result.add(ProductResponseDTO.withFilteredBatches(fullDto, nearBatches));
            }
        }
        return result;
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
        Family family = resolveFamily(dto.familyId(), dto.familyName(), brand, user);

        // update metadata
        product.name = trimmedName;
        product.brand = brand;
        product.category = category;
        product.family = family;

        product.quantity = dto.quantity();
        product.purchaseDate = dto.purchaseDate() != null ? dto.purchaseDate() : (product.purchaseDate != null ? product.purchaseDate : LocalDate.now());
        product.expirationDate = dto.expirationDate();
        product.purchasePrice = resolvePurchasePrice(dto.purchasePrice(), dto.sellingPrice());
        product.sellingPrice = dto.sellingPrice();

        product.persist();

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
