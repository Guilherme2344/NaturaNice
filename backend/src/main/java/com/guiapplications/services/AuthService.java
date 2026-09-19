package com.guiapplications.services;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;

import com.guiapplications.entities.PasswordResetToken;
import com.guiapplications.entities.TwoFactorToken;
import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.ChangePasswordRequestDTO;
import com.guiapplications.entities.dto.ForgotPasswordRequestDTO;
import com.guiapplications.entities.dto.LoginRequestDTO;
import com.guiapplications.entities.dto.LoginResponseDTO;
import com.guiapplications.entities.dto.ResendTwoFactorRequestDTO;
import com.guiapplications.entities.dto.ResetPasswordRequestDTO;
import com.guiapplications.entities.dto.TwoFactorVerifyRequestDTO;
import com.guiapplications.entities.dto.UserResponseDTO;
import com.guiapplications.entities.dto.VerifyCodeRequestDTO;
import com.guiapplications.events.PasswordResetRequestedEvent;
import com.guiapplications.events.TwoFactorCodeRequestedEvent;
import com.guiapplications.exceptions.ResourceNotFoundException;
import com.guiapplications.utils.JwtUtil;

import io.vertx.core.http.HttpServerRequest;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Inject
    Event<PasswordResetRequestedEvent> passwordResetEvent;

    @Inject
    Event<TwoFactorCodeRequestedEvent> twoFactorCodeEvent;

    @Inject
    LoginSecurityService loginSecurityService;

    @Transactional
    public LoginResponseDTO login(LoginRequestDTO dto, HttpServerRequest request) {
        if (dto.email() == null || dto.email().isBlank()) {
            throw new IllegalArgumentException("E-mail é obrigatório.");
        }
        if (dto.password() == null || dto.password().isBlank()) {
            throw new IllegalArgumentException("Senha é obrigatória.");
        }

        String emailKey = dto.email().trim().toLowerCase();

        // 1. Inspect Proxy/VPN headers and extract client IP
        loginSecurityService.inspectProxyAndVpn(request, emailKey);
        String clientIp = loginSecurityService.extractClientIp(request);

        // 2. Check Rate Limit (Max 5 attempts, 15-minute lock)
        loginSecurityService.checkRateLimit(emailKey, clientIp);

        User user = User.findByEmail(emailKey);
        if (user == null) {
            loginSecurityService.recordFailedAttempt(emailKey, clientIp);
            throw new IllegalArgumentException("E-mail ou senha inválidos.");
        }

        String hashedPassword = hashPassword(dto.password());
        if (!user.password.equals(hashedPassword)) {
            loginSecurityService.recordFailedAttempt(emailKey, clientIp);
            throw new IllegalArgumentException("E-mail ou senha inválidos.");
        }

        // Credentials are valid: reset rate limit attempts
        loginSecurityService.recordSuccess(emailKey, clientIp);

        // Clean any existing 2FA tokens for this email
        TwoFactorToken.deleteByEmail(emailKey);

        // Generate a 6-digit secure random code for 2FA
        int codeInt = SECURE_RANDOM.nextInt(900000) + 100000;
        String code = String.valueOf(codeInt);

        TwoFactorToken token = new TwoFactorToken();
        token.email = emailKey;
        token.code = code;
        token.expirationTime = LocalDateTime.now().plusMinutes(10); // 10-minute expiration
        token.user = user;
        token.persist();

        // Send 2FA code asynchronously via email
        twoFactorCodeEvent.fireAsync(new TwoFactorCodeRequestedEvent(emailKey, code));

        return new LoginResponseDTO(true, emailKey, null, null);
    }

    @Transactional
    public LoginResponseDTO verifyTwoFactor(TwoFactorVerifyRequestDTO dto) {
        if (dto.email() == null || dto.email().isBlank()) {
            throw new IllegalArgumentException("E-mail é obrigatório.");
        }
        if (dto.code() == null || dto.code().isBlank()) {
            throw new IllegalArgumentException("O código de verificação é obrigatório.");
        }

        String emailKey = dto.email().trim().toLowerCase();
        TwoFactorToken token = TwoFactorToken.findByEmailAndCode(emailKey, dto.code());
        if (token == null || token.isExpired()) {
            throw new IllegalArgumentException("Código de verificação (2FA) inválido ou expirado (validade de 10 minutos).");
        }

        User user = token.user;
        if (user == null) {
            user = User.findByEmail(emailKey);
        }
        if (user == null) {
            throw new ResourceNotFoundException("Usuário não encontrado.");
        }

        // Invalidate token after successful verification
        TwoFactorToken.deleteByEmail(emailKey);

        UserResponseDTO userDTO = new UserResponseDTO(
            user.id,
            user.name,
            user.email,
            user.role.name(),
            user.firstAccess
        );

        // Generate signed JWT Bearer Token
        String jwtToken = JwtUtil.generateToken(user);

        return new LoginResponseDTO(false, user.email, jwtToken, userDTO);
    }

    @Transactional
    public void resendTwoFactor(ResendTwoFactorRequestDTO dto) {
        if (dto.email() == null || dto.email().isBlank()) {
            throw new IllegalArgumentException("E-mail é obrigatório.");
        }

        String emailKey = dto.email().trim().toLowerCase();
        User user = User.findByEmail(emailKey);
        if (user == null) {
            throw new IllegalArgumentException("Usuário não encontrado.");
        }

        // Clean previous tokens
        TwoFactorToken.deleteByEmail(emailKey);

        // Generate a new 6-digit code
        int codeInt = SECURE_RANDOM.nextInt(900000) + 100000;
        String code = String.valueOf(codeInt);

        TwoFactorToken token = new TwoFactorToken();
        token.email = emailKey;
        token.code = code;
        token.expirationTime = LocalDateTime.now().plusMinutes(10);
        token.user = user;
        token.persist();

        twoFactorCodeEvent.fireAsync(new TwoFactorCodeRequestedEvent(emailKey, code));
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

        // Generate a 6-digit secure random code
        int codeInt = SECURE_RANDOM.nextInt(900000) + 100000;
        String code = String.valueOf(codeInt);

        PasswordResetToken token = new PasswordResetToken();
        token.email = dto.email().trim().toLowerCase();
        token.code = code;
        token.expirationTime = LocalDateTime.now().plusMinutes(15); // 15-minute expiration
        token.user = user;
        token.persist();

        passwordResetEvent.fireAsync(new PasswordResetRequestedEvent(token.email, code));
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
            throw new IllegalArgumentException("O código de verificação expirou (validade de 15 minutos). Solicite um novo código.");
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
