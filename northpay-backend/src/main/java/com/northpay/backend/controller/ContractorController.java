package com.northpay.backend.controller;

import com.northpay.backend.model.Contractor;
import com.northpay.backend.service.ContractorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/contractors")
public class ContractorController {

    @Autowired
    private ContractorService contractorService;

    // 1. Iniciar onboarding (Datos Personales)
    @PostMapping
    public ResponseEntity<Contractor> createContractor(@Valid @RequestBody Contractor contractor) {
        return ResponseEntity.ok(contractorService.createContractor(contractor));
    }

    // Listar todos los contratistas (Panel Admin)
    @GetMapping
    public ResponseEntity<List<Contractor>> getAllContractors() {
        return ResponseEntity.ok(contractorService.getAllContractors());
    }

    // Obtener detalle de un contratista
    @GetMapping("/{id}")
    public ResponseEntity<Contractor> getContractor(@PathVariable String id) {
        return ResponseEntity.ok(contractorService.getContractor(id));
    }

    // 2. Cargar documentos
    @PostMapping("/{id}/documents")
    public ResponseEntity<Contractor> uploadDocument(
            @PathVariable String id,
            @RequestParam("documentType") String documentType,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(contractorService.uploadDocument(id, documentType, file));
    }

    // 3. Firma del contrato
    @PutMapping("/{id}/contract")
    public ResponseEntity<Contractor> signContract(@PathVariable String id) {
        return ResponseEntity.ok(contractorService.signContract(id));
    }

    // 4. Configurar método de pago
    @PutMapping("/{id}/payment-method")
    public ResponseEntity<Contractor> configurePaymentMethod(
            @PathVariable String id,
            @RequestBody Map<String, String> paymentMethodDetails) {
        return ResponseEntity.ok(contractorService.configurePaymentMethod(id, paymentMethodDetails));
    }

    // 5. Actualizar estado (Admin: Aprobar, Solicitar cambios, etc.)
    @PutMapping("/{id}/status")
    public ResponseEntity<Contractor> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> statusUpdate) {
        String newStatus = statusUpdate.get("status");
        return ResponseEntity.ok(contractorService.updateStatus(id, newStatus));
    }
}
