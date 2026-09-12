package com.guiapplications.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.guiapplications.entities.Brand;
import com.guiapplications.entities.Family;
import com.guiapplications.entities.Product;
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

    private Brand resolveBrand(UUID brandId, String brandName, User user) {
        if (brandId != null) {
            return Brand.findById(brandId);
        }
        if (brandName != null && !brandName.isBlank()) {
            List<Brand> existing = Brand.findByNameAndUser(brandName.trim(), user);
            if (!existing.isEmpty()) {
                return existing.get(0);
            }
        }
        return null;
    }

    // create a Family
    @Transactional
    public FamilyResponseDTO create(FamilyRequestDTO dto, User user) {
        if (user == null) {
            throw new IllegalArgumentException("Sessão inválida ou expirada. Faça login novamente.");
        }
        String trimmedName = dto.name().trim();
        Brand brand = resolveBrand(dto.brandId(), dto.brandName(), user);

        // check if already exists the typed name for this brand and user
        List<Family> existing = Family.findByNameAndBrandAndUser(trimmedName, brand, user);
        if (!existing.isEmpty()) {
            throw new ResourceAlreadyExistsException("Já existe uma família cadastrada com o nome: " + trimmedName + (brand != null ? " para a marca " + brand.name : ""));
        }

        Family family = new Family();
        family.name = trimmedName;
        family.brand = brand;
        family.user = user;
        family.persist();
        return FamilyResponseDTO.fromEntity(family, true);
    }

    // list all families for user (optional brand filter)
    public List<FamilyResponseDTO> listAll(UUID brandId, User user) {
        if (user == null) return List.of();
        List<Family> families;
        if (brandId != null) {
            Brand brand = Brand.findById(brandId);
            families = Family.listByBrandAndUser(brand, user);
        } else {
            families = Family.listByUser(user);
        }
        if (families.isEmpty()) return List.of();

        List<Object[]> counts = Product.getEntityManager()
                .createQuery("SELECT p.family.id, COUNT(p) FROM Product p WHERE p.user = :user GROUP BY p.family.id", Object[].class)
                .setParameter("user", user)
                .getResultList();

        Map<UUID, Long> productCountsMap = new HashMap<>();
        for (Object[] row : counts) {
            if (row[0] != null) {
                productCountsMap.put((UUID) row[0], (Long) row[1]);
            }
        }

        return families.stream()
                .map(f -> {
                    long count = productCountsMap.getOrDefault(f.id, 0L);
                    return FamilyResponseDTO.fromEntity(f, count == 0);
                })
                .toList();
    }

    public List<FamilyResponseDTO> listAll(User user) {
        return listAll(null, user);
    }

    public List<FamilyResponseDTO> search(String name, UUID brandId, User user) {
        if (user == null) return List.of();
        List<Family> families;
        String searchParam = (name != null && !name.isBlank()) ? "%" + name.trim() + "%" : "%";
        if (brandId != null) {
            families = Family.list("SELECT DISTINCT f FROM Family f LEFT JOIN FETCH f.brand WHERE unaccent(LOWER(f.name)) LIKE unaccent(LOWER(?1)) AND f.brand.id = ?2 AND f.user = ?3 ORDER BY f.name ASC", searchParam, brandId, user);
        } else {
            families = Family.list("SELECT DISTINCT f FROM Family f LEFT JOIN FETCH f.brand WHERE unaccent(LOWER(f.name)) LIKE unaccent(LOWER(?1)) AND f.user = ?2 ORDER BY f.name ASC", searchParam, user);
        }
        if (families.isEmpty()) return List.of();

        List<Object[]> counts = Product.getEntityManager()
                .createQuery("SELECT p.family.id, COUNT(p) FROM Product p WHERE p.user = :user GROUP BY p.family.id", Object[].class)
                .setParameter("user", user)
                .getResultList();

        Map<UUID, Long> productCountsMap = new HashMap<>();
        for (Object[] row : counts) {
            if (row[0] != null) {
                productCountsMap.put((UUID) row[0], (Long) row[1]);
            }
        }

        return families.stream()
                .map(f -> {
                    long count = productCountsMap.getOrDefault(f.id, 0L);
                    return FamilyResponseDTO.fromEntity(f, count == 0);
                })
                .toList();
    }

    public List<FamilyResponseDTO> search(String name, User user) {
        return search(name, null, user);
    }

    @Transactional
    public FamilyResponseDTO update(UUID id, FamilyRequestDTO dto) {
        Family family = Family.findById(id);
        if (family == null) {
            throw new ResourceNotFoundException("Família com ID " + id + " não encontrada.");
        }

        String trimmedName = dto.name().trim();
        Brand brand = resolveBrand(dto.brandId(), dto.brandName(), family.user);
        if (dto.brandId() != null || dto.brandName() != null) {
            family.brand = brand;
        }

        if (family.user != null) {
            long duplicateCount;
            if (family.brand != null) {
                duplicateCount = Family.count(
                    "unaccent(LOWER(name)) = unaccent(LOWER(?1)) AND id != ?2 AND brand = ?3 AND user = ?4",
                    trimmedName, id, family.brand, family.user
                );
            } else {
                duplicateCount = Family.count(
                    "unaccent(LOWER(name)) = unaccent(LOWER(?1)) AND id != ?2 AND brand IS NULL AND user = ?3",
                    trimmedName, id, family.user
                );
            }
            if (duplicateCount > 0) {
                throw new ResourceAlreadyExistsException("Já existe outra família cadastrada com o nome: " + trimmedName);
            }
        }

        family.name = trimmedName;
        long count = Product.count("family", family);
        return FamilyResponseDTO.fromEntity(family, count == 0);
    }

    // delete family by id
    @Transactional
    public void delete(UUID id) {
        Family family = Family.findById(id);
        if (family == null) {
            throw new ResourceNotFoundException("Família com ID " + id + " não foi encontrada");
        }
        try {
            family.delete();
            Family.flush();
        } catch (ConstraintViolationException | PersistenceException e) {
            throw new ResourceInUseException("Não é possível excluir a família " + family.name + " pois existem produtos associados a ela");
        }
    }
}
