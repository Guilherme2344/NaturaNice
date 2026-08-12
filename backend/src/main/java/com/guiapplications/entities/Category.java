package com.guiapplications.entities;

import java.text.Normalizer;
import java.util.List;
import java.util.Map;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity
public class Category extends PanacheEntity {
	
	@Column(nullable = false, unique = true)
	public String name;
	
	// search categories by name
    public static List<Category> findByName(String name) {
        if (name == null || name.isBlank()) {
            return listAll();
        }

        String hql = "FROM Category c WHERE CAST(unaccent(LOWER(c.name)) AS String) LIKE :name";
        return list(hql, Map.of("name", "%" + normalizeText(name) + "%"));
    }
    
    // remove accents from words
    private static String normalizeText(String input) {
        if (input == null || input.isBlank()) return "";
        String normalized = Normalizer.normalize(input.trim().toLowerCase(), Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "");
    }
}
