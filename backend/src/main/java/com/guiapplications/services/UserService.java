package com.guiapplications.services;

import java.security.SecureRandom;
import java.util.List;
import java.util.stream.Collectors;

import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.CreateUserRequestDTO;
import com.guiapplications.entities.dto.UserResponseDTO;
import com.guiapplications.enums.Role;
import com.guiapplications.events.UserCreatedEvent;
import com.guiapplications.exceptions.ResourceNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class UserService {

    private static final String ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Inject
    Event<UserCreatedEvent> userCreatedEvent;

    public List<UserResponseDTO> getAllUsers() {
        return User.<User>listAllSorted().stream()
                .map(u -> new UserResponseDTO(u.id, u.name, u.email, u.role.name(), u.firstAccess))
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponseDTO createUser(CreateUserRequestDTO dto) {
        if (dto.name() == null || dto.name().isBlank()) {
            throw new IllegalArgumentException("Nome do usuário é obrigatório.");
        }
        if (dto.email() == null || dto.email().isBlank()) {
            throw new IllegalArgumentException("E-mail do usuário é obrigatório.");
        }

        String email = dto.email().trim().toLowerCase();
        if (User.findByEmail(email) != null) {
            throw new IllegalArgumentException("E-mail já cadastrado no sistema.");
        }

        String randomPassword = generateRandomPassword(8);
        String hashedPassword = AuthService.hashPassword(randomPassword);

        User user = new User();
        user.name = dto.name().trim();
        user.email = email;
        user.password = hashedPassword;
        user.role = Role.USER;
        user.firstAccess = true;

        user.persist();

        // Dispara o evento assíncrono via Quarkus Observer (CDI Event Bus) sem bloquear a resposta HTTP
        userCreatedEvent.fireAsync(new UserCreatedEvent(user.name, user.email, randomPassword));

        return new UserResponseDTO(
            user.id,
            user.name,
            user.email,
            user.role.name(),
            user.firstAccess
        );
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = User.findById(id);
        if (user == null) {
            throw new ResourceNotFoundException("Usuário não encontrado com id: " + id);
        }

        user.delete();
    }

    private String generateRandomPassword(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
        }
        return sb.toString();
    }
}
