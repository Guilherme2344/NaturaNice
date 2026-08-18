package com.guiapplications.entities;

import java.util.ArrayList;
import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User extends PanacheEntity {

    public enum Role {
        ADMIN,
        USER
    }

    @Column(nullable = false)
    public String name;

    @Column(nullable = false, unique = true)
    public String email;

    @Column(nullable = false)
    public String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Role role = Role.USER;

    @Column(nullable = false)
    public boolean firstAccess = false;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Customer> customers = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Product> products = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Sale> sales = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Brand> brands = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Category> categories = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Family> families = new ArrayList<>();

    public static User findByEmail(String email) {
        if (email == null || email.isBlank()) return null;
        return find("LOWER(email) = LOWER(?1)", email.trim()).firstResult();
    }

    public static List<User> listAllSorted() {
        return list("ORDER BY id DESC");
    }
}
