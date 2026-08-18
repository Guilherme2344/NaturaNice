package com.guiapplications.services;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Random;

import com.guiapplications.entities.PasswordResetToken;
import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.ChangePasswordRequestDTO;
import com.guiapplications.entities.dto.ForgotPasswordRequestDTO;
import com.guiapplications.entities.dto.LoginRequestDTO;
import com.guiapplications.entities.dto.LoginResponseDTO;
import com.guiapplications.entities.dto.ResetPasswordRequestDTO;
import com.guiapplications.entities.dto.UserResponseDTO;
import com.guiapplications.entities.dto.VerifyCodeRequestDTO;
import com.guiapplications.exceptions.ResourceNotFoundException;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class AuthService {

    @Inject
    Mailer mailer;

    @Transactional
    public LoginResponseDTO login(LoginRequestDTO dto) {
        if (dto.email() == null || dto.email().isBlank()) {
            throw new IllegalArgumentException("E-mail é obrigatório.");
        }
        if (dto.password() == null || dto.password().isBlank()) {
            throw new IllegalArgumentException("Senha é obrigatória.");
        }

        User user = User.findByEmail(dto.email());
        if (user == null) {
            throw new IllegalArgumentException("E-mail ou senha inválidos.");
        }

        String hashedPassword = hashPassword(dto.password());
        if (!user.password.equals(hashedPassword)) {
            throw new IllegalArgumentException("E-mail ou senha inválidos.");
        }

        UserResponseDTO userDTO = new UserResponseDTO(
            user.id,
            user.name,
            user.email,
            user.role.name(),
            user.firstAccess
        );

        String fakeToken = "mock-jwt-token-for-user-" + user.id;

        return new LoginResponseDTO(fakeToken, userDTO);
    }

    @Transactional
    public UserResponseDTO changeFirstPassword(ChangePasswordRequestDTO dto) {
        if (dto.userId() == null) {
            throw new IllegalArgumentException("ID do usuário é obrigatório.");
        }
        if (dto.newPassword() == null || dto.newPassword().isBlank() || dto.newPassword().length() < 6) {
            throw new IllegalArgumentException("A nova senha deve ter no mínimo 6 caracteres.");
        }

        User user = User.findById(dto.userId());
        if (user == null) {
            throw new ResourceNotFoundException("Usuário não encontrado.");
        }

        user.password = hashPassword(dto.newPassword());
        user.firstAccess = false;
        user.persist();

        return new UserResponseDTO(
            user.id,
            user.name,
            user.email,
            user.role.name(),
            user.firstAccess
        );
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequestDTO dto) {
        if (dto.email() == null || dto.email().isBlank()) {
            throw new IllegalArgumentException("E-mail é obrigatório.");
        }

        User user = User.findByEmail(dto.email());
        if (user == null) {
            throw new IllegalArgumentException("E-mail ou senha inválidos.");
        }

        PasswordResetToken.deleteByEmail(dto.email());

        String code = String.format("%06d", new Random().nextInt(900000) + 100000);
        PasswordResetToken token = new PasswordResetToken();
        token.email = dto.email().trim().toLowerCase();
        token.code = code;
        token.expirationTime = LocalDateTime.now().plusMinutes(15);
        token.persist();

        // Disparo do E-mail Real via Protocolo SMTP (Quarkus Mailer)
        String htmlBody = "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 500px;'>" +
                          "<h2 style='color: #099268;'>Recuperação de Senha - Natura Nice</h2>" +
                          "<p>Olá,</p>" +
                          "<p>Você solicitou a redefinição de senha da sua conta. Utilize o código de 6 dígitos abaixo para prosseguir:</p>" +
                          "<div style='background-color: #f4f6f8; padding: 15px; text-align: center; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #1c7ed6; margin: 20px 0;'>" +
                          code +
                          "</div>" +
                          "<p style='font-size: 12px; color: #888;'>Este código expira em 15 minutos. Caso não tenha solicitado esta alteração, desconsidere esta mensagem.</p>" +
                          "</div>";

        try {
            mailer.send(Mail.withHtml(dto.email().trim().toLowerCase(), "Código de Recuperação de Senha - Natura Nice", htmlBody));
            System.out.println("[SMTP MAILER] E-mail de recuperação enviado para: " + dto.email());
        } catch (Exception e) {
            System.err.println("[SMTP MAILER WARNING] Erro ao disparar e-mail SMTP real: " + e.getMessage());
        }
    }

    @Transactional
    public boolean verifyCode(VerifyCodeRequestDTO dto) {
        if (dto.email() == null || dto.code() == null) {
            return false;
        }

        PasswordResetToken token = PasswordResetToken.findByEmailAndCode(dto.email(), dto.code());
        if (token == null || token.isExpired()) {
            return false;
        }

        return true;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequestDTO dto) {
        if (dto.email() == null || dto.code() == null || dto.newPassword() == null) {
            throw new IllegalArgumentException("Dados incompletos para redefinição de senha.");
        }
        if (dto.newPassword().length() < 6) {
            throw new IllegalArgumentException("A nova senha deve ter no mínimo 6 caracteres.");
        }

        PasswordResetToken token = PasswordResetToken.findByEmailAndCode(dto.email(), dto.code());
        if (token == null || token.isExpired()) {
            throw new IllegalArgumentException("Código de verificação inválido ou expirado.");
        }

        User user = User.findByEmail(dto.email());
        if (user == null) {
            throw new ResourceNotFoundException("Usuário não encontrado.");
        }

        user.password = hashPassword(dto.newPassword());
        user.firstAccess = false;
        user.persist();

        PasswordResetToken.deleteByEmail(dto.email());
    }

    public static String hashPassword(String rawPassword) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(rawPassword.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erro ao gerar hash da senha", e);
        }
    }
}
