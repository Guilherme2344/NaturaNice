package com.guiapplications.entities;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Product", indexes = {
    @Index(name = "idx_product_name", columnList = "name"),
    @Index(name = "idx_product_expiration_date", columnList = "expirationDate"),
    @Index(name = "idx_product_user_id", columnList = "user_id")
})
public class Product extends PanacheEntity {

    @Column(name = "name", nullable = false, length = 100)
    public String name;

    @Column(name = "quantity", nullable = false)
    public Integer quantity;

    @Column(name = "expirationDate", nullable = false)
    public LocalDate expirationDate;

    @Column(name = "purchasePrice", nullable = true)
    public BigDecimal purchasePrice;

    @Column(name = "sellingPrice", nullable = false)
    public BigDecimal sellingPrice;

    @Column(name = "profit", nullable = true)
    public BigDecimal profit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_id", nullable = false)
    public Family family;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    public Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    public Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    public User user;

    // search products by name
    public static List<Product> findByName(String name) {
        return list("LOWER(name) LIKE LOWER(?1)", "%" + name + "%");
    }

    // search products to expire in a period of days
    public static List<Product> findExpiringInDays(int days) {
        LocalDate limitDate = LocalDate.now().plusDays(days);
        return list("expirationDate <= ?1 AND expirationDate >= ?2", limitDate, LocalDate.now());
    }

    // dynamic search
    public static List<Product> findWithFilters(
            String query, String familyName, String brandName, String categoryName, LocalDate maxExpDate, User user
    ) {
        StringBuilder hql = new StringBuilder(
                "SELECT DISTINCT p FROM Product p " +
                "LEFT JOIN FETCH p.brand b " +
                "LEFT JOIN FETCH p.category c " +
                "LEFT JOIN FETCH p.family f " +
                "WHERE 1=1"
            );
        Map<String, Object> params = new HashMap<>();

        if (user != null) {
            hql.append(" AND p.user = :user");
            params.put("user", user);
        }

        // wide search
        if (query != null && !query.isBlank()) {
            hql.append(" AND (CAST(unaccent(LOWER(p.name)) AS String) LIKE :query")
                .append(" OR CAST(unaccent(LOWER(b.name)) AS String) LIKE :query")
                .append(" OR CAST(unaccent(LOWER(c.name)) AS String) LIKE :query")
                .append(" OR CAST(unaccent(LOWER(f.name)) AS String) LIKE :query)");
            params.put("query", "%" + normalizeText(query) + "%");
        }

        // search by family
        if (familyName != null && !familyName.isBlank()) {
            hql.append(" AND CAST(unaccent(LOWER(f.name)) AS String) LIKE :familyName");
            params.put("familyName", "%" + normalizeText(familyName) + "%");
        }

        // search by brand
        if (brandName != null && !brandName.isBlank()) {
            hql.append(" AND CAST(unaccent(LOWER(b.name)) AS String) LIKE :brandName");
            params.put("brandName", "%" + normalizeText(brandName) + "%");
        }

        // search by category
        if (categoryName != null && !categoryName.isBlank()) {
            hql.append(" AND CAST(unaccent(LOWER(c.name)) AS String) LIKE :categoryName");
            params.put("categoryName", "%" + normalizeText(categoryName) + "%");
        }

        // search by date limit
        if (maxExpDate != null) {
            hql.append(" AND p.expirationDate <= :maxExpDate");
            params.put("maxExpDate", maxExpDate);
        }

        return list(hql.toString(), params);
    }

    // list all products with relations fetched in a single query (prevents N+1)
    public static List<Product> listAllWithRelations(User user) {
        if (user == null) {
            return list("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.brand LEFT JOIN FETCH p.category LEFT JOIN FETCH p.family");
        }
        return list("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.brand LEFT JOIN FETCH p.category LEFT JOIN FETCH p.family WHERE p.user = ?1", user);
    }

    // products expired: expirationDate <= current data
    public static List<Product> findExpired(User user) {
        if (user == null) {
            return list("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.brand LEFT JOIN FETCH p.category LEFT JOIN FETCH p.family WHERE p.expirationDate <= CURRENT_DATE ORDER BY p.expirationDate ASC");
        }
        return list("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.brand LEFT JOIN FETCH p.category LEFT JOIN FETCH p.family WHERE p.expirationDate <= CURRENT_DATE AND p.user = ?1 ORDER BY p.expirationDate ASC", user);
    }

    // products near expiration: within tomorrow and the next 540 days range
    public static List<Product> findNearExpiration(User user) {
        LocalDate today = LocalDate.now();
        LocalDate limitDate = today.plusDays(540);
        if (user == null) {
            return list("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.brand LEFT JOIN FETCH p.category LEFT JOIN FETCH p.family WHERE p.expirationDate > CURRENT_DATE AND p.expirationDate <= ?1 ORDER BY p.expirationDate ASC", limitDate);
        }
        return list("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.brand LEFT JOIN FETCH p.category LEFT JOIN FETCH p.family WHERE p.expirationDate > CURRENT_DATE AND p.expirationDate <= ?1 AND p.user = ?2 ORDER BY p.expirationDate ASC", limitDate, user);
    }

    // remove accents from words
    private static String normalizeText(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String normalized = Normalizer.normalize(input.trim().toLowerCase(), Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "");
    }
}
