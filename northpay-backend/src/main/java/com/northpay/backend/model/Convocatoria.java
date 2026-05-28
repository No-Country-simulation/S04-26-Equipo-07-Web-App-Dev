package com.northpay.backend.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "convocatorias")
@Data
public class Convocatoria {

    @Id
    private String id;

    private String companyId;
    private String createdBy;

    private String title;
    private String description;
    private String location;

    // remote | hybrid | on-site
    private String modality;

    // full-time | part-time | freelance
    private String contractType;

    // rango salarial opcional
    private Double salaryMin;
    private Double salaryMax;

    // rango de fechas de la convocatoria
    private LocalDate startDate;
    private LocalDate endDate;

    // requisitos tecnicos (lista de tags)
    private List<String> technicalRequirements = new ArrayList<>();

    // preguntas a postulantes
    private List<String> questions = new ArrayList<>();

    // costo en creditos para publicar ($1/dia)
    private double creditCost;

    // estadisticas
    private int views = 0;
    private int applicationCount = 0;

    // DRAFT | ACTIVE | CLOSED | CANCELLED
    private String status = "DRAFT";

    // fecha de activacion para calculo de devolucion
    private LocalDateTime activatedAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
