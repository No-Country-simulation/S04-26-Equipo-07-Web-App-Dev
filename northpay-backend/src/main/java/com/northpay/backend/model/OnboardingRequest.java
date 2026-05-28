package com.northpay.backend.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "onboarding_requests")
@Data
public class OnboardingRequest {

    @Id
    private String id;

    private String userId;
    private String assignedWorkerId;

    // PENDING | IN_REVIEW | APPROVED | REJECTED
    private String status = "PENDING";

    // datos personales del contratista (copiados al enviar onboarding)
    private String fullName;
    private String email;
    private String phone;
    private String phoneCode;
    private String dateOfBirth;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String country;

    // revision individual de cada documento subido por el usuario
    private List<DocumentReview> documentReviews = new ArrayList<>();

    // revision de los datos personales ingresados
    private List<InformationReview> informationReviews = new ArrayList<>();

    // historial de acciones del trabajador sobre esta solicitud
    private List<ActionEntry> actionHistory = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    public static class DocumentReview {
        private String documentKey;
        private String name;
        private String url;
        private String fileName;
        // PENDING | APPROVED | REJECTED
        private String status = "PENDING";
        private String observation;
        private String reviewedBy;
        private LocalDateTime reviewedAt;
    }

    @Data
    public static class InformationReview {
        private String field;
        private String value;
        // PENDING | APPROVED | REJECTED
        private String status = "PENDING";
        private String observation;
        private String reviewedBy;
        private LocalDateTime reviewedAt;
    }

    @Data
    public static class ActionEntry {
        private String workerId;
        private String action;
        private String notes;
        private LocalDateTime timestamp;
    }
}
