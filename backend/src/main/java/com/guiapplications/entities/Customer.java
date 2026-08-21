package com.guiapplications.entities;

import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "customers")
public class Customer extends PanacheEntity {

    @Column(name = "name", nullable = false, length = 100)
    public String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    public User user;

    public static Customer findByName(String name) {
        if (name == null || name.isBlank()) return null;
        return find("unaccent(LOWER(name)) = unaccent(LOWER(?1))", name.trim()).firstResult();
    }

    public static Customer findByNameAndUser(String name, User user) {
        if (name == null || name.isBlank()) return null;
        if (user == null) {
            return findByName(name);
        }
        return find("unaccent(LOWER(name)) = unaccent(LOWER(?1)) AND user = ?2", name.trim(), user).firstResult();
    }

    public static List<Customer> listAllSorted() {
        return list("ORDER BY name ASC");
    }

    public static List<Customer> listByUser(User user) {
        if (user == null) {
            return listAllSorted();
        }
        return list("user = ?1 ORDER BY name ASC", user);
    }
}
