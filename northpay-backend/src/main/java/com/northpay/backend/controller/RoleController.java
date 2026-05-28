package com.northpay.backend.controller;

import com.northpay.backend.dto.role.CreateRoleRequest;
import com.northpay.backend.model.Role;
import com.northpay.backend.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/worker/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    public ResponseEntity<List<Role>> findAll() {
        return ResponseEntity.ok(roleService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Role> findById(@PathVariable String id) {
        return ResponseEntity.ok(roleService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Role> create(@Valid @RequestBody CreateRoleRequest req) {
        return ResponseEntity.ok(roleService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Role> update(@PathVariable String id, @Valid @RequestBody CreateRoleRequest req) {
        return ResponseEntity.ok(roleService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        roleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
