package com.northpay.backend.controller;

import com.northpay.backend.dto.convocatoria.ConvocatoriaRequest;
import com.northpay.backend.model.Application;
import com.northpay.backend.model.Convocatoria;
import com.northpay.backend.service.ConvocatoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/convocatorias")
@RequiredArgsConstructor
public class ConvocatoriaController {

    private final ConvocatoriaService convocatoriaService;

    @GetMapping
    public ResponseEntity<List<Convocatoria>> findAll(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(convocatoriaService.findAll());
    }

    @GetMapping("/my")
    public ResponseEntity<List<Convocatoria>> findMine(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(convocatoriaService.findByUser(principal.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Convocatoria> findById(@PathVariable String id) {
        return ResponseEntity.ok(convocatoriaService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Convocatoria> create(
            @Valid @RequestBody ConvocatoriaRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(convocatoriaService.create(principal.getUsername(), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Convocatoria> update(
            @PathVariable String id,
            @Valid @RequestBody ConvocatoriaRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(convocatoriaService.update(id, principal.getUsername(), req));
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<Convocatoria> publish(@PathVariable String id) {
        return ResponseEntity.ok(convocatoriaService.publish(id));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<Convocatoria> close(@PathVariable String id) {
        return ResponseEntity.ok(convocatoriaService.close(id));
    }

    @PutMapping("/{id}/finalize")
    public ResponseEntity<Map<String, Object>> finalize(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(convocatoriaService.finalize(id, principal.getUsername()));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> incrementView(@PathVariable String id) {
        convocatoriaService.incrementViews(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/applications")
    public ResponseEntity<List<Application>> getApplications(@PathVariable String id) {
        return ResponseEntity.ok(convocatoriaService.getApplications(id));
    }

    @PostMapping(value = "/{id}/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Application> apply(
            @PathVariable String id,
            @RequestParam String applicantName,
            @RequestParam String applicantEmail,
            @RequestParam(required = false) String applicantPhone,
            @RequestParam(required = false) String applicantLinkedIn,
            @RequestParam(required = false) List<String> answers,
            @RequestParam(required = false) MultipartFile file) throws Exception {
        return ResponseEntity.ok(convocatoriaService.apply(
            id, applicantName, applicantEmail, applicantPhone, applicantLinkedIn, answers, file));
    }

    /** Calcula el costo estimado en creditos dado un rango de fechas */
    @GetMapping("/cost-estimate")
    public ResponseEntity<Map<String, Object>> costEstimate(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        java.time.LocalDate start = java.time.LocalDate.parse(startDate);
        java.time.LocalDate end = java.time.LocalDate.parse(endDate);
        double cost = ConvocatoriaService.calculateCost(start, end);
        return ResponseEntity.ok(Map.of("cost", cost, "days", (long) cost));
    }
}
