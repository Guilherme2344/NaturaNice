package com.guiapplications.events;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.ObservesAsync;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

// Asynchronous observer component for background email processing
@ApplicationScoped
public class EmailEventsObserver {

    private static final Logger LOG = Logger.getLogger(EmailEventsObserver.class);

    @Inject
    Mailer mailer;

    // Send temporary password email when a new user is created
    public void onUserCreated(@ObservesAsync UserCreatedEvent event) {
        String htmlBody = "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 500px;'>" +
                          "<h2 style='color: #099268;'>Bem-vindo(a) ao Natura Nice!</h2>" +
                          "<p>Olá <b>" + event.name() + "</b>,</p>" +
                          "<p>Sua conta no sistema foi criada pelo administrador. Utilize a senha provisória abaixo para efetuar seu primeiro acesso:</p>" +
                          "<div style='background-color: #f4f6f8; padding: 15px; text-align: center; border-radius: 6px; font-size: 22px; font-weight: bold; letter-spacing: 3px; color: #1c7ed6; margin: 20px 0;'>" +
                          event.tempPassword() +
                          "</div>" +
                          "<p style='font-size: 13px; color: #555;'>No seu primeiro login, o sistema solicitará automaticamente que você defina uma nova senha pessoal.</p>" +
                          "</div>";

        try {
            mailer.send(Mail.withHtml(event.email(), "Sua Senha Provisória de Primeiro Acesso - Natura Nice", htmlBody));
            LOG.info("[SMTP MAILER] Senha provisória enviada com sucesso para: " + event.email());
        } catch (Exception e) {
            LOG.warn("[SMTP MAILER NOTICE] Falha ao enviar e-mail de primeiro acesso (" + e.getMessage() +
                     "). Para enviar e-mails reais via Gmail, configure no arquivo backend/.env: SMTP_USERNAME, " +
                     "SMTP_PASSWORD (Senha de App de 16 dígitos do Google) e defina SMTP_MOCK=false.");
        }
    }

    // Send password recovery verification code email
    public void onPasswordResetRequested(@ObservesAsync PasswordResetRequestedEvent event) {
        String htmlBody = "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 500px;'>" +
                          "<h2 style='color: #099268;'>Recuperação de Senha - Natura Nice</h2>" +
                          "<p>Olá,</p>" +
                          "<p>Você solicitou a redefinição de senha da sua conta. Utilize o código de 6 dígitos abaixo para prosseguir:</p>" +
                          "<div style='background-color: #f4f6f8; padding: 15px; text-align: center; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #1c7ed6; margin: 20px 0;'>" +
                          event.code() +
                          "</div>" +
                          "<p style='font-size: 12px; color: #888;'>Este código expira em 15 minutos. Caso não tenha solicitado esta alteração, desconsidere esta mensagem.</p>" +
                          "</div>";

        try {
            mailer.send(Mail.withHtml(event.email(), "Código de Recuperação de Senha - Natura Nice", htmlBody));
            LOG.info("[SMTP MAILER] E-mail de recuperação enviado para: " + event.email());
        } catch (Exception e) {
            LOG.warn("[SMTP MAILER NOTICE] Falha ao enviar e-mail de recuperação (" + e.getMessage() +
                     "). Para enviar e-mails reais via Gmail, configure no arquivo backend/.env: SMTP_USERNAME, " +
                     "SMTP_PASSWORD (Senha de App de 16 dígitos do Google) e defina SMTP_MOCK=false.");
        }
    }
}
