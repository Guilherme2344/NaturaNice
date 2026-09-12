package com.guiapplications.entities;

import java.util.List;
import java.util.UUID;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "families")
public class Family extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    public UUID id;

    @Column(name = "name", nullable = false, length = 100)
    public String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    public Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    public User user;

    public static List<Family> findByNameAndUser(String name, User user) {
        if (name == null || user == null) return List.of();
        String trimmed = name.trim();
        return list("SELECT DISTINCT f FROM Family f LEFT JOIN FETCH f.brand WHERE unaccent(LOWER(f.name)) = unaccent(LOWER(?1)) AND f.user = ?2", trimmed, user);
    }

    public static List<Family> findByNameAndBrandAndUser(String name, Brand brand, User user) {
        if (name == null || user == null) return List.of();
        String trimmed = name.trim();
        if (brand != null) {
            return list("SELECT DISTINCT f FROM Family f LEFT JOIN FETCH f.brand WHERE unaccent(LOWER(f.name)) = unaccent(LOWER(?1)) AND f.brand = ?2 AND f.user = ?3", trimmed, brand, user);
        }
        return findByNameAndUser(name, user);
    }

    public static List<Family> listByUser(User user) {
        if (user == null) return List.of();
        return list("SELECT DISTINCT f FROM Family f LEFT JOIN FETCH f.brand WHERE f.user = ?1 ORDER BY f.name ASC", user);
    }

    public static List<Family> listByBrandAndUser(Brand brand, User user) {
        if (user == null) return List.of();
        if (brand == null) return listByUser(user);
        return list("SELECT DISTINCT f FROM Family f LEFT JOIN FETCH f.brand WHERE f.brand = ?1 AND f.user = ?2 ORDER BY f.name ASC", brand, user);
    }
}
