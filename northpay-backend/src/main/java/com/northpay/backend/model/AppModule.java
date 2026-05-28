package com.northpay.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "modules")
@Data
public class AppModule {

    @Id
    private String id;

    private String title;
    private String description;

    // ruta del sistema para este modulo (ej: /worker/solicitudes)
    private String path;

    // nombre del icono (lucide-react) para el sidebar
    private String icon;

    // grupo al que pertenece (ej: sistema, gestion, usuario)
    private String group;

    // acciones requeridas para acceder (ej: ["solicitudes:read"])
    private List<String> requiredPermissions = new ArrayList<>();

    private boolean active = true;

    // orden de aparicion en el sidebar dentro del grupo
    private int order = 0;
}
