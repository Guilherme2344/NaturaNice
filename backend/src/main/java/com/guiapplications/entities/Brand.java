package com.guiapplications.entities;

import java.text.Normalizer;
import java.util.List;
import java.util.Map;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "brands")
public class Brand extends PanacheEntity {
	
	@Column(nullable = false)
	public String name;
	@Column(nullable = false, length = 7)
	public String hexColor;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = true)
	public User user;
	
    // search brands by name and user
    public static List<Brand> findByNameAndUser(String name, User user) {
        if (user == null) {
            return findByName(name);
        }
        if (name == null || name.isBlank()) {
            return list("user = ?1", user);
        }

        String hql = "FROM Brand b WHERE b.user = :user AND CAST(unaccent(LOWER(b.name)) AS String) LIKE :name";
        return list(hql, Map.of("user", user, "name", "%" + normalizeText(name) + "%"));
    }

    public static List<Brand> findByName(String name) {
        if (name == null || name.isBlank()) {
            return listAll();
        }

        String hql = "FROM Brand b WHERE CAST(unaccent(LOWER(b.name)) AS String) LIKE :name";
        return list(hql, Map.of("name", "%" + normalizeText(name) + "%"));
    }

    public static List<Brand> listByUser(User user) {
        if (user == null) {
            return listAll();
        }
        return list("user = ?1", user);
    }
    
    // remove accents from words
    private static String normalizeText(String input) {
        if (input == null || input.isBlank()) return "";
        String normalized = Normalizer.normalize(input.trim().toLowerCase(), Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "");
    }
}
