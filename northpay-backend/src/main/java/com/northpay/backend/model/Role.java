package com.northpay.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "roles")
@Data
public class Role {

    @Id
    private String id;

    private String name;
    private String description;

    // permisos embebidos: cada permiso referencia un modulo y las acciones permitidas
    private List<RolePermission> permissions = new ArrayList<>();

    @Data
    public static class RolePermission {
        private String moduleId;
        // acciones posibles: read, write, delete, approve
        private List<String> actions = new ArrayList<>();
    }
}
