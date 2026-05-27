package com.northpay.backend.controller;

import com.northpay.backend.model.Company;
import com.northpay.backend.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<List<Company>> list(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(companyService.listByActor(principal.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getById(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String id) {
        return ResponseEntity.ok(companyService.getByIdForActor(principal.getUsername(), id));
    }

    @PostMapping
    public ResponseEntity<Company> create(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody Company payload) {
        return ResponseEntity.ok(companyService.createForActor(principal.getUsername(), payload));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> update(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String id,
            @RequestBody Company payload) {
        return ResponseEntity.ok(companyService.updateForActor(principal.getUsername(), id, payload));
    }
}
