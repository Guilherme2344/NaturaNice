package com.guiapplications.entities;

import java.time.LocalDateTime;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken extends PanacheEntity {

    @Column(nullable = false)
    public String email;

    @Column(nullable = false, length = 6)
    public String code;

    @Column(nullable = false)
    public LocalDateTime expirationTime;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expirationTime);
    }

    public static PasswordResetToken findByEmailAndCode(String email, String code) {
        if (email == null || code == null) return null;
        return find("LOWER(email) = LOWER(?1) AND code = ?2", email.trim(), code.trim()).firstResult();
    }

    public static void deleteByEmail(String email) {
        delete("LOWER(email) = LOWER(?1)", email.trim());
    }
}
