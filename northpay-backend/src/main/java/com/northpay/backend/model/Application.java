package com.northpay.backend.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "applications")
@Data
public class Application {

    @Id
    private String id;

    private String convocatoriaId;

    private String applicantName;
    private String applicantEmail;
    private String applicantPhone;
    private String applicantLinkedIn;

    // respuestas a las preguntas (mismo orden que questions en Convocatoria)
    private List<String> answers = new ArrayList<>();

    // URL del CV/archivo opcional subido a Cloudinary
    private String fileUrl;

    @CreatedDate
    private LocalDateTime appliedAt;
}
