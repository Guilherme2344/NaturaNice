package com.guiapplications.entities;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.List;

@Entity
@Table(name = "customers")
public class Customer extends PanacheEntity {

    @Column(nullable = false)
    public String name;

    public static Customer findByName(String name) {
        if (name == null || name.isBlank()) return null;
        return find("unaccent(LOWER(name)) = unaccent(LOWER(?1))", name.trim()).firstResult();
    }

    public static List<Customer> listAllSorted() {
        return list("ORDER BY name ASC");
    }
}
