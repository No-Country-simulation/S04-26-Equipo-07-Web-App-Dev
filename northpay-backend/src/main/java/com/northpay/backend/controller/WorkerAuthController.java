package com.northpay.backend.controller;

import com.northpay.backend.dto.auth.LoginRequest;
import com.northpay.backend.dto.auth.LoginResponse;
import com.northpay.backend.service.WorkerAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worker/auth")
@RequiredArgsConstructor
public class WorkerAuthController {

    private final WorkerAuthService workerAuthService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(workerAuthService.workerLogin(req.getEmail(), req.getPassword()));
    }
}
