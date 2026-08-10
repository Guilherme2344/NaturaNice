package com.guiapplications.entities;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Product extends PanacheEntity {
	
	public String name;
	public Integer quantity;
	public LocalDate expirationDate;
	public BigDecimal purchasePrice;
	public BigDecimal sellingPrice;
	
	@ManyToOne
	@JoinColumn(name = "family_id")
	public Family family;
	
	@ManyToOne
	@JoinColumn(name = "brand_id")
	public Brand brand;
	
	@ManyToOne
	@JoinColumn(name = "category_id")
	public Category category;
	
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
            String query, String familyName, String brandName, String categoryName, LocalDate maxExpDate
    ) {
    	StringBuilder hql = new StringBuilder(
    	        "SELECT DISTINCT p FROM Product p " +
    	        "LEFT JOIN FETCH p.brand b " +
    	        "LEFT JOIN FETCH p.category c " +
    	        "LEFT JOIN FETCH p.family f " +
    	        "WHERE 1=1"
    	    );
        Map<String, Object> params = new HashMap<>();

        // wide search
        if (query != null && !query.isBlank()) {
        	hql.append(" AND (CAST(unaccent(LOWER(p.name)) AS String) LIKE :query")
	            .append(" OR CAST(unaccent(LOWER(b.name)) AS String) LIKE :query")
	            .append(" OR CAST(unaccent(LOWER(c.name)) AS String) LIKE :query")
	            .append(" OR CAST(unaccent(LOWER(f.name)) AS String) LIKE :query)");
            params.put("query", "%" + normalizeText(query) + "%");
        }

        // FILTERS START
        
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

        // FILTERS END
        
        // return data
        return list(hql.toString(), params);
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
