package com.northpay.backend.service;

import com.northpay.backend.exception.InvitationException;
import com.northpay.backend.model.Invitation;
import com.northpay.backend.model.Worker;
import com.northpay.backend.repository.InvitationRepository;
import com.northpay.backend.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final WorkerRepository workerRepository;
    private final EmailService emailService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // crea y envia una nueva invitacion para el email dado
    public Invitation sendInvitation(String email, String workerId) {
        boolean hasPending = invitationRepository.existsByEmailAndStatus(email, "pending");
        if (hasPending) {
            throw new InvitationException("ya existe una invitacion pendiente para este email");
        }

        byte[] tokenBytes = new byte[32];
        SECURE_RANDOM.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        Invitation invitation = new Invitation();
        invitation.setEmail(email);
        invitation.setToken(token);
        invitation.setInvitedBy(workerId);
        invitation.setExpiresAt(LocalDateTime.now().plusHours(48));

        invitationRepository.save(invitation);

        Worker worker = workerRepository.findById(workerId)
            .orElseThrow(() -> new InvitationException("trabajador no encontrado"));

        emailService.sendInvitationEmail(email, token, worker.getFirstName() + " " + worker.getLastName());
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
}
