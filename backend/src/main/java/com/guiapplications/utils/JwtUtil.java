package com.guiapplications.utils;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.eclipse.microprofile.config.ConfigProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.guiapplications.entities.User;
import org.jboss.logging.Logger;

public class JwtUtil {

    private static final Logger LOG = Logger.getLogger(JwtUtil.class);
    private static final String DEFAULT_SECRET = "NaturaNiceSuperSecretKeyForJWTAuthTokenSigningInDevEnv2026!";
    private static final long EXPIRATION_SECONDS = 60 * 60; // 1 hour (3600 seconds)
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static String getSecretKey() {
        try {
            return ConfigProvider.getConfig()
                    .getOptionalValue("jwt.secret", String.class)
                    .orElse(System.getenv().getOrDefault("JWT_SECRET", DEFAULT_SECRET));
        } catch (Exception e) {
            return System.getenv().getOrDefault("JWT_SECRET", DEFAULT_SECRET);
        }
    }

    public static String generateToken(User user) {
        try {
            long now = Instant.now().getEpochSecond();
            long exp = now + EXPIRATION_SECONDS;
            String secretKey = getSecretKey();

            String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
            String payloadJson = String.format(
                "{\"sub\":\"%s\",\"email\":\"%s\",\"role\":\"%s\",\"iat\":%d,\"exp\":%d}",
                user.id.toString(),
                user.email.replace("\"", "\\\""),
                user.role.name(),
                now,
                exp
            );

            String encodedHeader = base64UrlEncode(headerJson.getBytes(StandardCharsets.UTF_8));
            String encodedPayload = base64UrlEncode(payloadJson.getBytes(StandardCharsets.UTF_8));

            String dataToSign = encodedHeader + "." + encodedPayload;
            String signature = hmacSha256(dataToSign, secretKey);

            return dataToSign + "." + signature;
        } catch (Exception e) {
            LOG.error("Erro ao gerar JWT Token: ", e);
            throw new RuntimeException("Erro na geração do token JWT.");
        }
    }

    public static UUID validateAndExtractUserId(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }

        try {
            String cleanToken = token.trim();
            if (cleanToken.startsWith("Bearer ") || cleanToken.startsWith("bearer ")) {
                cleanToken = cleanToken.substring(7).trim();
            }

            String[] parts = cleanToken.split("\\.");
            if (parts.length != 3) {
                return null;
            }

            String secretKey = getSecretKey();
            String dataToSign = parts[0] + "." + parts[1];
            String expectedSignature = hmacSha256(dataToSign, secretKey);

            if (!expectedSignature.equals(parts[2])) {
                LOG.warn("Assinatura do JWT inválida.");
                return null;
            }

            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            JsonNode payload = MAPPER.readTree(payloadBytes);

            long exp = payload.has("exp") ? payload.get("exp").asLong() : 0;
            long now = Instant.now().getEpochSecond();

            if (exp > 0 && now > exp) {
                LOG.warn("Token JWT expirado.");
                return null;
            }

            if (payload.has("sub")) {
                return UUID.fromString(payload.get("sub").asText());
            }
        } catch (Exception e) {
            LOG.debug("Falha na validação do token JWT: " + e.getMessage());
        }

        return null;
    }

    private static String hmacSha256(String data, String key) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKey);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return base64UrlEncode(hash);
    }

    private static String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
