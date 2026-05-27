package com.northpay.backend.controller;

import com.northpay.backend.dto.auth.LoginRequest;
import com.northpay.backend.dto.auth.LoginResponse;
import com.northpay.backend.dto.auth.RegisterRequest;
import com.northpay.backend.dto.auth.SetPasswordRequest;
import com.northpay.backend.model.Invitation;
import com.northpay.backend.model.User;
import com.northpay.backend.service.AuthService;
import com.northpay.backend.service.InvitationService;
import com.northpay.backend.service.LogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final InvitationService invitationService;
    private final LogService logService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletRequest httpRequest) {
        LoginResponse response = authService.login(req.getEmail(), req.getPassword());
        // registra el login como log del usuario
        logService.logUser(response.getId(), "LOGIN", "inicio de sesion exitoso", httpRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(
            @Valid @RequestBody RegisterRequest req,
            HttpServletRequest httpRequest) {
        User user = authService.registerWithInvitation(req);
        logService.logUser(user.getId(), "REGISTER", "nuevo usuario registrado", httpRequest);
        // no retornar el campo password en la respuesta
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/set-password")
    public ResponseEntity<Map<String, String>> setPassword(@Valid @RequestBody SetPasswordRequest req) {
        authService.setupPassword(req);
        return ResponseEntity.ok(Map.of("message", "contrasena configurada correctamente"));
    }

    // valida un token de invitacion antes de mostrar el formulario de registro
    @GetMapping("/invitation/validate")
    public ResponseEntity<Map<String, Object>> validateInvitation(@RequestParam String token) {
        Invitation invitation = invitationService.validateToken(token);
        return ResponseEntity.ok(Map.of(
            "valid", true,
            "email", invitation.getEmail()
        ));
    }
}
