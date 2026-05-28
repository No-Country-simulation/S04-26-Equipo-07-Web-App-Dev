package com.northpay.backend.controller;

import com.northpay.backend.dto.auth.LoginRequest;
import com.northpay.backend.dto.auth.LoginResponse;
import com.northpay.backend.dto.auth.RegisterRequest;
import com.northpay.backend.dto.auth.SetPasswordRequest;
import com.northpay.backend.model.Invitation;
import com.northpay.backend.model.User;
import com.northpay.backend.service.AuthService;
import com.northpay.backend.service.FileUploadService;
import com.northpay.backend.service.InvitationService;
import com.northpay.backend.service.LogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final InvitationService invitationService;
    private final FileUploadService fileUploadService;
    private final LogService logService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletRequest httpRequest) {
        LoginResponse response = authService.login(req.getEmail(), req.getPassword());
        logService.logUser(response.getId(), "LOGIN", "inicio de sesion exitoso", httpRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(
            @Valid @RequestBody RegisterRequest req,
            HttpServletRequest httpRequest) {
        User user = authService.registerWithInvitation(req);
        logService.logUser(user.getId(), "REGISTER", "nuevo usuario registrado", httpRequest);
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

    // endpoint publico para subir documentos durante el registro; usa el token de
    // invitacion como mecanismo de autenticacion
    @PostMapping(value = "/upload-document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadDocument(
            @RequestParam("token") String token,
            @RequestParam("documentType") String documentType,
            @RequestPart("file") MultipartFile file) throws IOException {
        // valida que el token de invitacion sea valido antes de aceptar el archivo
        invitationService.validateToken(token);
        String url = fileUploadService.uploadFile(file);
        return ResponseEntity.ok(Map.of("url", url, "documentType", documentType));
    }
}
