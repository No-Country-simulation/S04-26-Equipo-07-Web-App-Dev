package com.northpay.backend.controller;

import com.northpay.backend.dto.worker.CreateWorkerRequest;
import com.northpay.backend.model.Worker;
import com.northpay.backend.service.WorkerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/worker/workers")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerService workerService;

    @GetMapping
    public ResponseEntity<List<Worker>> findAll() {
        return ResponseEntity.ok(workerService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Worker> findById(@PathVariable String id) {
        return ResponseEntity.ok(workerService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Worker> create(@Valid @RequestBody CreateWorkerRequest req) {
        return ResponseEntity.ok(workerService.create(req));
    }

    // asigna lista de roleIds al trabajador
    @PutMapping("/{id}/roles")
    public ResponseEntity<Worker> assignRoles(@PathVariable String id, @RequestBody Map<String, List<String>> body) {
        return ResponseEntity.ok(workerService.assignRoles(id, body.get("roleIds")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable String id) {
        workerService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
