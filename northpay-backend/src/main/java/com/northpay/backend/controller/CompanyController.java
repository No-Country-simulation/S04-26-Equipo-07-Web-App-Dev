package com.northpay.backend.controller;

import com.northpay.backend.model.Company;
import com.northpay.backend.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<List<Company>> list(
            @AuthenticationPrincipal(expression = "username") String actorId) {
        return ResponseEntity.ok(companyService.listByActor(actorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getById(
            @AuthenticationPrincipal(expression = "username") String actorId,
            @PathVariable String id) {
        return ResponseEntity.ok(companyService.getByIdForActor(actorId, id));
    }

    @PostMapping
    public ResponseEntity<Company> create(
            @AuthenticationPrincipal(expression = "username") String actorId,
            @RequestBody Company payload) {
        return ResponseEntity.ok(companyService.createForActor(actorId, payload));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> update(
            @AuthenticationPrincipal(expression = "username") String actorId,
            @PathVariable String id,
            @RequestBody Company payload) {
        return ResponseEntity.ok(companyService.updateForActor(actorId, id, payload));
    }
}
