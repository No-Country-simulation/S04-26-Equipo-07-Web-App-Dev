package com.northpay.backend.controller;

import com.northpay.backend.dto.invitation.InvitationRequest;
import com.northpay.backend.model.Invitation;
import com.northpay.backend.service.InvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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
        Invitation invitation = invitationService.sendInvitation(req.getEmail(), principal.getUsername());
        return ResponseEntity.ok(invitation);
    }
}
