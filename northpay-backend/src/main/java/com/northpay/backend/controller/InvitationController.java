package com.northpay.backend.controller;

import com.northpay.backend.dto.invitation.InvitationRequest;
import com.northpay.backend.exception.AuthException;
import com.northpay.backend.model.Invitation;
import com.northpay.backend.service.InvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/worker/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    // solo trabajadores autenticados pueden enviar invitaciones
    @PostMapping
    public ResponseEntity<Invitation> sendInvitation(
            @Valid @RequestBody InvitationRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        String workerId = (principal != null) ? principal.getUsername() : null;
        if (workerId == null || workerId.isBlank()) {
            throw new AuthException("usuario no autenticado");
        }
        Invitation invitation = invitationService.sendInvitation(req.getEmail(), workerId);
        return ResponseEntity.ok(invitation);
    }

    // listar invitaciones enviadas por el trabajador actual
    @GetMapping
    public ResponseEntity<List<Invitation>> getMyInvitations(
            @AuthenticationPrincipal UserDetails principal) {
        String workerId = (principal != null) ? principal.getUsername() : null;
        if (workerId == null || workerId.isBlank()) {
            throw new AuthException("usuario no autenticado");
        }
        List<Invitation> invitations = invitationService.getInvitationsByWorker(workerId);
        return ResponseEntity.ok(invitations);
    }

    // cancelar una invitacion
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelInvitation(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails principal) {
        String workerId = (principal != null) ? principal.getUsername() : null;
        if (workerId == null || workerId.isBlank()) {
            throw new AuthException("usuario no autenticado");
        }
        invitationService.cancelInvitation(id, workerId);
        return ResponseEntity.noContent().build();
    }

    // reenviar una invitacion
    @PostMapping("/{id}/resend")
    public ResponseEntity<Invitation> resendInvitation(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails principal) {
        String workerId = (principal != null) ? principal.getUsername() : null;
        if (workerId == null || workerId.isBlank()) {
            throw new AuthException("usuario no autenticado");
        }
        Invitation invitation = invitationService.resendInvitation(id, workerId);
        return ResponseEntity.ok(invitation);
    }
}
