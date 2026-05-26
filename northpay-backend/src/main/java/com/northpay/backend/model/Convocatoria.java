package com.northpay.backend.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

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

    // costo en creditos para publicar
    private double creditCost;

    // DRAFT | ACTIVE | CLOSED | CANCELLED
    private String status = "DRAFT";

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
