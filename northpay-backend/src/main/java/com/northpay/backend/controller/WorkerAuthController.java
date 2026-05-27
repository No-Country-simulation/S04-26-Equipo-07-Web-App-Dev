package com.northpay.backend.controller;

import com.northpay.backend.dto.auth.LoginRequest;
import com.northpay.backend.dto.auth.LoginResponse;
import com.northpay.backend.service.LogService;
import com.northpay.backend.service.WorkerAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worker/auth")
@RequiredArgsConstructor
public class WorkerAuthController {

    private final WorkerAuthService workerAuthService;
    private final LogService logService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletRequest httpRequest) {
        LoginResponse response = workerAuthService.workerLogin(req.getEmail(), req.getPassword());
        // registra el login como log del trabajador
        logService.logWorker(response.getId(), "LOGIN", "inicio de sesion exitoso", httpRequest);
        return ResponseEntity.ok(response);
    }
}
