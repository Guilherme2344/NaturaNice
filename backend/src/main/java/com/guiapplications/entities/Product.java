package com.guiapplications.entities;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_product_name", columnList = "name"),
    @Index(name = "idx_product_expiration_date", columnList = "expirationDate"),
    @Index(name = "idx_product_user_id", columnList = "user_id")
})
public class Product extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    public UUID id;

    @Column(name = "name", nullable = false, length = 255)
    public String name;

    @Column(name = "quantity", nullable = false)
    public Integer quantity;

    @Column(name = "expirationDate", nullable = false)
    public LocalDate expirationDate;

    @Column(name = "purchasePrice", nullable = false, precision = 10, scale = 2)
    public BigDecimal purchasePrice;

    @Column(name = "sellingPrice", nullable = false, precision = 10, scale = 2)
    public BigDecimal sellingPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    public Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    public Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_id", nullable = false)
    public Family family;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    public User user;

    public static List<Product> listAllWithRelations(User user) {
        if (user == null) {
            return List.of();
        }
        return list(
            "SELECT DISTINCT p FROM Product p " +
            "LEFT JOIN FETCH p.brand " +
            "LEFT JOIN FETCH p.category " +
            "LEFT JOIN FETCH p.family " +
            "WHERE p.user = ?1 " +
            "ORDER BY p.id DESC",
            user
        );
    }

    public static List<Product> findExpired(User user) {
        if (user == null) {
            return List.of();
        }
        LocalDate today = LocalDate.now();
        return list(
            "SELECT DISTINCT p FROM Product p " +
            "LEFT JOIN FETCH p.brand " +
            "LEFT JOIN FETCH p.category " +
            "LEFT JOIN FETCH p.family " +
            "WHERE p.expirationDate < ?1 AND p.user = ?2 " +
            "ORDER BY p.expirationDate ASC",
            today, user
        );
    }

    public static List<Product> findNearExpiration(User user) {
        if (user == null) {
            return List.of();
        }
        LocalDate today = LocalDate.now();
        LocalDate hundredEightyDaysFromNow = today.plusDays(180);
        return list(
            "SELECT DISTINCT p FROM Product p " +
            "LEFT JOIN FETCH p.brand " +
            "LEFT JOIN FETCH p.category " +
            "LEFT JOIN FETCH p.family " +
            "WHERE p.expirationDate >= ?1 AND p.expirationDate <= ?2 AND p.user = ?3 " +
            "ORDER BY p.expirationDate ASC",
            today, hundredEightyDaysFromNow, user
        );
    }

    public static List<Product> findWithFilters(
            String queryText, String familyName, String brandName, String categoryName, LocalDate maxExpDate, User user
    ) {
        if (user == null) {
            return List.of();
        }
        StringBuilder query = new StringBuilder("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.brand LEFT JOIN FETCH p.category LEFT JOIN FETCH p.family WHERE p.user = :user ");
        Map<String, Object> params = new HashMap<>();
        params.put("user", user);

        if (queryText != null && !queryText.isBlank()) {
            query.append("AND (CAST(unaccent(LOWER(p.name)) AS String) LIKE :queryText OR CAST(unaccent(LOWER(p.brand.name)) AS String) LIKE :queryText) ");
            params.put("queryText", "%" + removeAccents(queryText.trim().toLowerCase()) + "%");
        }

        if (familyName != null && !familyName.isBlank()) {
            query.append("AND CAST(unaccent(LOWER(p.family.name)) AS String) = :familyName ");
            params.put("familyName", removeAccents(familyName.trim().toLowerCase()));
        }

        if (brandName != null && !brandName.isBlank()) {
            query.append("AND CAST(unaccent(LOWER(p.brand.name)) AS String) = :brandName ");
            params.put("brandName", removeAccents(brandName.trim().toLowerCase()));
        }

        if (categoryName != null && !categoryName.isBlank()) {
            query.append("AND CAST(unaccent(LOWER(p.category.name)) AS String) = :categoryName ");
            params.put("categoryName", removeAccents(categoryName.trim().toLowerCase()));
        }

        if (maxExpDate != null) {
            query.append("AND p.expirationDate <= :maxExpDate ");
            params.put("maxExpDate", maxExpDate);
        }

        query.append("ORDER BY p.id DESC");

        return list(query.toString(), params);
    }

    private static String removeAccents(String text) {
        return text == null ? null : Normalizer.normalize(text, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
    }
}
