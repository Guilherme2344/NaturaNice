package com.guiapplications.entities;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.guiapplications.enums.Role;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    public UUID id;

    @Column(name = "name", nullable = false, length = 100)
    public String name;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    public String email;

    @Column(name = "password", nullable = false, length = 255)
    public String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    public Role role = Role.USER;

    @Column(name = "firstAccess", nullable = false)
    public boolean firstAccess = true;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Brand> brands = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Category> categories = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Family> families = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Customer> customers = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Product> products = new ArrayList<>();

    public static User findByEmail(String email) {
        if (email == null) return null;
        return find("LOWER(email) = LOWER(?1)", email.trim()).firstResult();
    }

    public static List<User> listAllSorted() {
        return list("ORDER BY name ASC");
    }
}
