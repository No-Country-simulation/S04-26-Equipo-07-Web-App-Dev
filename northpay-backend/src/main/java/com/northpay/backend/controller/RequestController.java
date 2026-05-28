package com.northpay.backend.controller;

import com.northpay.backend.dto.request.ReviewDocumentRequest;
import com.northpay.backend.dto.request.UpdateRequestStatusRequest;
import com.northpay.backend.model.OnboardingRequest;
import com.northpay.backend.service.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/worker/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;

    @GetMapping
    public ResponseEntity<List<OnboardingRequest>> findAll(@RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(requestService.findByStatus(status));
        }
        return ResponseEntity.ok(requestService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OnboardingRequest> findById(@PathVariable String id) {
        return ResponseEntity.ok(requestService.findById(id));
    }

    // asigna el trabajador autenticado a la solicitud
    @PutMapping("/{id}/assign")
    public ResponseEntity<OnboardingRequest> assign(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(requestService.assignWorker(id, principal.getUsername()));
    }

    @PutMapping("/{id}/documents/{key}/review")
    public ResponseEntity<OnboardingRequest> reviewDocument(
            @PathVariable String id,
            @PathVariable String key,
            @Valid @RequestBody ReviewDocumentRequest dto,
            @AuthenticationPrincipal UserDetails principal) {
        dto.setDocumentKey(key);
        return ResponseEntity.ok(requestService.reviewDocument(id, principal.getUsername(), dto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OnboardingRequest> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateRequestStatusRequest dto,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(requestService.updateStatus(id, principal.getUsername(), dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRejected(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails principal) {
        requestService.deleteRejectedRequest(id, principal.getUsername());
        return ResponseEntity.noContent().build();
    }
}
