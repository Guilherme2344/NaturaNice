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
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "brands", indexes = {
    @Index(name = "idx_brand_name", columnList = "name"),
    @Index(name = "idx_brand_user_id", columnList = "user_id")
})
public class Brand extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    public UUID id;

    @Column(name = "name", nullable = false, length = 100)
    public String name;

    @Column(name = "hexColor", nullable = false, length = 7)
    public String hexColor = "#1C7ED6";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    public User user;

    public static List<Brand> findByNameAndUser(String name, User user) {
        if (name == null || user == null) return List.of();
        String trimmed = name.trim();
        return list("unaccent(LOWER(name)) = unaccent(LOWER(?1)) AND user = ?2", trimmed, user);
    }

    public static List<Brand> listByUser(User user) {
        if (user == null) return List.of();
        return list("user = ?1 ORDER BY name ASC", user);
    }
}
