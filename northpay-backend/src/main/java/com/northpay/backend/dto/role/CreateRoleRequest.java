package com.northpay.backend.dto.role;

import com.northpay.backend.model.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CreateRoleRequest {
    @NotBlank
    private String name;
    private String description;
    private List<Role.RolePermission> permissions;
}
