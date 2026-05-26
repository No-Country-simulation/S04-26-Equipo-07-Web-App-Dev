package com.northpay.backend.service;

import com.northpay.backend.dto.role.CreateRoleRequest;
import com.northpay.backend.exception.ResourceNotFoundException;
import com.northpay.backend.model.Role;
import com.northpay.backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    public Role findById(String id) {
        return roleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("rol no encontrado: " + id));
    }

    public Role create(CreateRoleRequest req) {
        Role role = new Role();
        role.setName(req.getName());
        role.setDescription(req.getDescription());
        role.setPermissions(req.getPermissions() != null ? req.getPermissions() : new ArrayList<>());
        return roleRepository.save(role);
    }

    public Role update(String id, CreateRoleRequest req) {
        Role role = findById(id);
        role.setName(req.getName());
        role.setDescription(req.getDescription());
        if (req.getPermissions() != null) {
            role.setPermissions(req.getPermissions());
        }
        return roleRepository.save(role);
    }

    public void delete(String id) {
        findById(id);
        roleRepository.deleteById(id);
    }
}
