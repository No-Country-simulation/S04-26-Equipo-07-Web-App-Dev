package com.northpay.backend.controller;

import com.northpay.backend.dto.module.CreateModuleRequest;
import com.northpay.backend.model.AppModule;
import com.northpay.backend.service.ModuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/worker/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;

    @GetMapping
    public ResponseEntity<List<AppModule>> findAll(@RequestParam(required = false) String group) {
        if (group != null) {
            return ResponseEntity.ok(moduleService.findByGroup(group));
        }
        return ResponseEntity.ok(moduleService.findAll());
    }

    @PostMapping
    public ResponseEntity<AppModule> create(@Valid @RequestBody CreateModuleRequest req) {
        return ResponseEntity.ok(moduleService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppModule> update(@PathVariable String id, @Valid @RequestBody CreateModuleRequest req) {
        return ResponseEntity.ok(moduleService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        moduleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
