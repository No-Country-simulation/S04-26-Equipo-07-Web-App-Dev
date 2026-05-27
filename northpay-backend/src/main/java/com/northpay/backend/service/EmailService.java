package com.northpay.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // envia email de invitacion con link de registro
    @Async
    public void sendInvitationEmail(String toEmail, String token, String inviterName) {
        String link = frontendUrl + "/register?token=" + token;
        String html = renderTemplate("email/invitation.html", Map.of(
            "INVITER_NAME", inviterName,
            "REGISTRATION_LINK", link
        ));
        sendHtml(toEmail, "Invitation to NorthPay", html);
    }

    // envia email cuando el trabajador aprueba todos los documentos del onboarding
    @Async
    public void sendApprovalEmail(String toEmail, String setupToken, String userName) {
        String link = frontendUrl + "/set-password?token=" + setupToken;
        String html = renderTemplate("email/approval.html", Map.of(
            "USER_NAME", userName,
            "SET_PASSWORD_LINK", link
        ));
        sendHtml(toEmail, "Tu cuenta en NorthPay fue aprobada", html);
    }

    // notifica al usuario que un documento fue rechazado con la observacion
    @Async
    public void sendDocumentRejectionEmail(String toEmail, String documentKey, String observation, String userName) {
        String html = renderTemplate("email/document-rejected.html", Map.of(
            "USER_NAME", userName,
            "DOCUMENT_KEY", documentKey,
            "OBSERVATION", observation
        ));
        sendHtml(toEmail, "Documento rechazado en NorthPay", html);
    }

    private void sendHtml(String toEmail, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, StandardCharsets.UTF_8.name());
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("error enviando correo html", e);
        }
    }

    private String renderTemplate(String templatePath, Map<String, String> values) {
        try {
            ClassPathResource resource = new ClassPathResource("templates/" + templatePath);
            String html = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            for (Map.Entry<String, String> entry : values.entrySet()) {
                html = html.replace("{{" + entry.getKey() + "}}", entry.getValue());
            }
            return html;
        } catch (IOException e) {
            throw new RuntimeException("error cargando template de correo", e);
        }
    }
}
