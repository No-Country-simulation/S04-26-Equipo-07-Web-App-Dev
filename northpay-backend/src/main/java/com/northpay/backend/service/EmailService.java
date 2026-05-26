package com.northpay.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

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
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Invitation to NorthPay");
        message.setText(
            "Hola,\n\n" +
            inviterName + " te ha invitado a registrarte en NorthPay.\n\n" +
            "Completa tu registro aqui:\n" + link + "\n\n" +
            "Este link expira en 48 horas."
        );
        mailSender.send(message);
    }

    // envia email cuando el trabajador aprueba todos los documentos del onboarding
    @Async
    public void sendApprovalEmail(String toEmail, String setupToken, String userName) {
        String link = frontendUrl + "/set-password?token=" + setupToken;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Tu cuenta en NorthPay fue aprobada");
        message.setText(
            "Hola " + userName + ",\n\n" +
            "Tu documentacion ha sido revisada y aprobada.\n\n" +
            "Configura tu contrasena aqui:\n" + link + "\n\n" +
            "Este link expira en 72 horas."
        );
        mailSender.send(message);
    }

    // notifica al usuario que un documento fue rechazado con la observacion
    @Async
    public void sendDocumentRejectionEmail(String toEmail, String documentKey, String observation, String userName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Documento rechazado en NorthPay");
        message.setText(
            "Hola " + userName + ",\n\n" +
            "El documento '" + documentKey + "' fue rechazado.\n\n" +
            "Observacion: " + observation + "\n\n" +
            "Por favor, sube el documento corregido en tu portal."
        );
        mailSender.send(message);
    }
}
