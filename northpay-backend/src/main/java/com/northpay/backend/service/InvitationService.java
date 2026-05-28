package com.northpay.backend.service;

import com.northpay.backend.exception.InvitationException;
import com.northpay.backend.model.Invitation;
import com.northpay.backend.model.Worker;
import com.northpay.backend.repository.InvitationRepository;
import com.northpay.backend.repository.WorkerRepository;
import com.northpay.backend.service.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final WorkerRepository workerRepository;
    private final EmailService emailService;
    private final LogService logService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // lista las invitaciones enviadas por un trabajador (ordenadas por fecha descendente)
    public List<Invitation> getInvitationsByWorker(String workerId) {
        return invitationRepository.findByInvitedByOrderByCreatedAtDesc(workerId);
    }

    // cancela una invitacion (cambia estado a cancelled)
    public void cancelInvitation(String invitationId, String workerId) {
        Invitation invitation = invitationRepository.findById(invitationId)
            .orElseThrow(() -> new InvitationException("invitacion no encontrada"));

        if (!invitation.getInvitedBy().equals(workerId)) {
            throw new InvitationException("no tienes permiso para cancelar esta invitacion");
        }

        if (!"pending".equals(invitation.getStatus())) {
            throw new InvitationException("solo se pueden cancelar invitaciones pendientes");
        }

        invitation.setStatus("cancelled");
        invitationRepository.save(invitation);
        logService.logWorker(workerId, "INVITATION_CANCELLED", "invitacion cancelada: " + invitation.getEmail());
    }

    // reenvia una invitacion (genera nuevo token y actualiza expiracion)
    public Invitation resendInvitation(String invitationId, String workerId) {
        Invitation oldInvitation = invitationRepository.findById(invitationId)
            .orElseThrow(() -> new InvitationException("invitacion no encontrada"));

        if (!oldInvitation.getInvitedBy().equals(workerId)) {
            throw new InvitationException("no tienes permiso para reenviar esta invitacion");
        }

        // si ya esta pendiente, solo actualizamos el token y la fecha de expiracion
        if ("pending".equals(oldInvitation.getStatus())) {
            byte[] tokenBytes = new byte[32];
            SECURE_RANDOM.nextBytes(tokenBytes);
            String newToken = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

            oldInvitation.setToken(newToken);
            oldInvitation.setExpiresAt(LocalDateTime.now().plusHours(48));
            Invitation updated = invitationRepository.save(oldInvitation);

            Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new InvitationException("trabajador no encontrado"));

            emailService.sendInvitationEmail(
                oldInvitation.getEmail(),
                newToken,
                worker.getFirstName() + " " + worker.getLastName()
            );
            logService.logWorker(workerId, "INVITATION_RESENT", "invitacion reenviada a: " + oldInvitation.getEmail());
            return updated;
        }

        // si no esta pendiente, creamos una nueva
        return sendInvitation(oldInvitation.getEmail(), workerId);
    }

    // crea y envia una nueva invitacion para el email dado
    public Invitation sendInvitation(String email, String workerId) {
        boolean hasPending = invitationRepository.existsByEmailAndStatus(email, "pending");
        if (hasPending) {
            throw new InvitationException("ya existe una invitacion pendiente para este email");
        }

        // elimina invitaciones previas (usadas/expiradas) para este email
        invitationRepository.findByEmail(email).ifPresent(invitationRepository::delete);

        byte[] tokenBytes = new byte[32];
        SECURE_RANDOM.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        Invitation invitation = new Invitation();
        invitation.setEmail(email);
        invitation.setToken(token);
        invitation.setInvitedBy(workerId);
        invitation.setStatus("pending");
        invitation.setExpiresAt(LocalDateTime.now().plusHours(48));

        invitationRepository.save(invitation);

        Worker worker = workerRepository.findById(workerId)
            .orElseThrow(() -> new InvitationException("trabajador no encontrado"));

        emailService.sendInvitationEmail(email, token, worker.getFirstName() + " " + worker.getLastName());
        logService.logWorker(workerId, "INVITATION_SENT", "invitacion enviada a: " + email);
        return invitation;
    }

    // valida que el token exista, este pendiente y no haya expirado
    public Invitation validateToken(String token) {
        Invitation invitation = invitationRepository.findByToken(token)
            .orElseThrow(() -> new InvitationException("invitacion no encontrada"));

        if (!"pending".equals(invitation.getStatus())) {
            throw new InvitationException("esta invitacion ya fue utilizada o expirada");
        }

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus("expired");
            invitationRepository.save(invitation);
            throw new InvitationException("esta invitacion ha expirado");
        }

        return invitation;
    }

    // marca la invitacion como usada
    public void useToken(String token) {
        Invitation invitation = invitationRepository.findByToken(token)
            .orElseThrow(() -> new InvitationException("invitacion no encontrada"));
        invitation.setStatus("used");
        invitationRepository.save(invitation);
    }

    // marca la invitacion como completada (cuando el onboarding termina)
    public void completeOnboarding(String email) {
        invitationRepository.findByEmail(email).ifPresent(invitation -> {
            if ("pending".equals(invitation.getStatus()) || "resend".equals(invitation.getStatus())) {
                invitation.setStatus("completed");
                invitationRepository.save(invitation);
            }
        });
    }

    // marca la invitacion como resend (para que el invite pueda volver a enviar)
    public void resetToResend(String email) {
        invitationRepository.findByEmail(email).ifPresent(invitation -> {
            invitation.setStatus("resend");
            invitationRepository.save(invitation);
        });
    }

    // marca la invitacion como approved (cuando el worker aprueba la solicitud)
    public void markAsApproved(String email) {
        invitationRepository.findByEmail(email).ifPresent(invitation -> {
            invitation.setStatus("approved");
            invitationRepository.save(invitation);
        });
    }
}
