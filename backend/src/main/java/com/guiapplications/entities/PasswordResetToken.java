package com.guiapplications.entities;

import java.time.LocalDateTime;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken extends PanacheEntity {

    @Column(name = "email", nullable = false, length = 255)
    public String email;

    @Column(name = "code", nullable = false, length = 6)
    public String code;

    @Column(name = "expirationTime", nullable = false)
    public LocalDateTime expirationTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    public User user;

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
