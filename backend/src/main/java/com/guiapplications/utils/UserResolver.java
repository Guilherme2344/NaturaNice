package com.guiapplications.utils;

import java.util.UUID;
import com.guiapplications.entities.User;

public class UserResolver {

    public static User resolveUser(String authHeader, String userIdHeader) {
        // 1. Try JWT Token from Authorization header
        if (authHeader != null && !authHeader.isBlank()) {
            UUID jwtUserId = JwtUtil.validateAndExtractUserId(authHeader);
            if (jwtUserId != null) {
                User user = User.findById(jwtUserId);
                if (user != null) {
                    return user;
                }
            }
        }

        // 2. Fallback to X-User-Id header if provided
        if (userIdHeader != null && !userIdHeader.isBlank()) {
            try {
                String clean = userIdHeader.trim().replace("\"", "");
                UUID id = UUID.fromString(clean);
                User user = User.findById(id);
                if (user != null) {
                    return user;
                }
            } catch (Exception ignored) {}
        }

        // 3. Dev fallback to default admin user
        User admin = User.findByEmail("admin@sistema.com");
        if (admin != null) {
            return admin;
        }
        return User.<User>findAll().firstResult();
    }

    public static User resolveUser(String header) {
        if (header != null && (header.startsWith("Bearer ") || header.startsWith("bearer "))) {
            return resolveUser(header, null);
        }
        return resolveUser(null, header);
    }
}
