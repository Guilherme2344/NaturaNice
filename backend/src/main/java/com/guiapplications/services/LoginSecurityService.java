package com.guiapplications.services;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import io.vertx.core.http.HttpServerRequest;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

@ApplicationScoped
public class LoginSecurityService {

    private static final Logger LOG = Logger.getLogger(LoginSecurityService.class);
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_SECONDS = 15 * 60; // 15 minutes

    private static class AttemptInfo {
        int failedCount;
        long lastAttemptTimestamp;

        AttemptInfo(int failedCount, long lastAttemptTimestamp) {
            this.failedCount = failedCount;
            this.lastAttemptTimestamp = lastAttemptTimestamp;
        }
    }

    private final Map<String, AttemptInfo> attemptsMap = new ConcurrentHashMap<>();

    private void cleanupExpiredAttempts() {
        long now = Instant.now().getEpochSecond();
        attemptsMap.entrySet().removeIf(entry -> (now - entry.getValue().lastAttemptTimestamp) > LOCKOUT_DURATION_SECONDS);
    }

    public String extractClientIp(HttpServerRequest request) {
        if (request == null) {
            return "127.0.0.1";
        }
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        if (request.remoteAddress() != null) {
            return request.remoteAddress().host();
        }
        return "127.0.0.1";
    }

    public void inspectProxyAndVpn(HttpServerRequest request, String email) {
        if (request == null) return;

        String clientIp = extractClientIp(request);
        LOG.info("Tentativa de login registrada para [" + email + "] a partir do IP: " + clientIp);

        // List of headers that indicate proxy / VPN usage
        String[] proxyHeaders = {
            "Via",
            "Proxy-Connection",
            "X-Proxy-ID",
            "X-BlueCoat-Via",
            "Forwarded",
            "X-Authenticated-User",
            "CF-Connecting-IP",
            "X-Client-IP"
        };

        for (String headerName : proxyHeaders) {
            String val = request.getHeader(headerName);
            if (val != null && !val.isBlank()) {
                LOG.warn("Proxy/VPN detectado via cabeçalho [" + headerName + " = " + val + "] no IP: " + clientIp);
                throw new IllegalArgumentException(
                    "Uso de Proxy ou VPN detectado (cabeçalho: " + headerName + "). Por favor, desligue o Proxy/VPN para realizar o login."
                );
            }
        }

        // Check if X-Forwarded-For contains multiple proxy nodes
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && xff.contains(",")) {
            LOG.warn("Cadeia de Proxy detectada em X-Forwarded-For [" + xff + "] no IP: " + clientIp);
            throw new IllegalArgumentException(
                "Uso de Proxy ou VPN em cadeia detectado. Por favor, desligue o Proxy/VPN para realizar o login."
            );
        }
    }

    public void checkRateLimit(String emailKey, String clientIp) {
        cleanupExpiredAttempts();

        if (emailKey == null || emailKey.isBlank()) {
            return;
        }

        String key = emailKey.trim().toLowerCase();
        AttemptInfo info = attemptsMap.get(key);

        if (info != null) {
            long now = Instant.now().getEpochSecond();
            long timeElapsed = now - info.lastAttemptTimestamp;

            if (timeElapsed > LOCKOUT_DURATION_SECONDS) {
                attemptsMap.remove(key);
                return;
            }

            if (info.failedCount >= MAX_FAILED_ATTEMPTS) {
                long minutesRemaining = Math.max(1, (LOCKOUT_DURATION_SECONDS - timeElapsed) / 60);
                LOG.warn("Login bloqueado por rate limit para [" + key + "] no IP: " + clientIp);
                throw new IllegalArgumentException(
                    "Limite de tentativas de acesso excedido (5 tentativas incorretas). " +
                    "Sua conta foi bloqueada temporariamente. Tente novamente em " + minutesRemaining + " minuto(s)."
                );
            }
        }
    }

    public void recordFailedAttempt(String emailKey, String clientIp) {
        cleanupExpiredAttempts();

        if (emailKey == null || emailKey.isBlank()) {
            return;
        }

        String key = emailKey.trim().toLowerCase();
        long now = Instant.now().getEpochSecond();

        attemptsMap.compute(key, (k, old) -> {
            int count = (old == null || (now - old.lastAttemptTimestamp) > LOCKOUT_DURATION_SECONDS) ? 1 : old.failedCount + 1;
            LOG.warn("Tentativa de login incorreta (" + count + "/" + MAX_FAILED_ATTEMPTS + ") para [" + key + "] no IP: " + clientIp);
            return new AttemptInfo(count, now);
        });
    }

    public void recordSuccess(String emailKey, String clientIp) {
        if (emailKey != null) {
            String key = emailKey.trim().toLowerCase();
            attemptsMap.remove(key);
            LOG.info("Login realizado com sucesso para [" + key + "] no IP: " + clientIp);
        }
    }
}
