package com.northpay.backend.controller;

import com.northpay.backend.dto.convocatoria.ConvocatoriaRequest;
import com.northpay.backend.model.Convocatoria;
import com.northpay.backend.service.ConvocatoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/convocatorias")
@RequiredArgsConstructor
public class ConvocatoriaController {

    private final ConvocatoriaService convocatoriaService;

    @GetMapping
    public ResponseEntity<List<Convocatoria>> findAll(@AuthenticationPrincipal UserDetails principal) {
        // si es trabajador retorna todas, si es usuario retorna las suyas
        // la distincion se hace via el claim type en el jwt (simplificado aqui)
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

    @PutMapping("/{id}/publish")
    public ResponseEntity<Convocatoria> publish(@PathVariable String id) {
        return ResponseEntity.ok(convocatoriaService.publish(id));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<Convocatoria> close(@PathVariable String id) {
        return ResponseEntity.ok(convocatoriaService.close(id));
    }
}
