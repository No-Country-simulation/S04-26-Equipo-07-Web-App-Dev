package com.northpay.backend.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "onboarding_requests")
@Data
public class OnboardingRequest {

    @Id
    private String id;

    private String userId;
    private String assignedWorkerId;

    // PENDING | IN_REVIEW | APPROVED | REJECTED
    private String status = "PENDING";

    // URLs de documentos subidos a Cloudinary: clave = tipo (id/address/tax), valor = URL
    private Map<String, String> documentUrls = new HashMap<>();

    // revision individual de cada documento subido por el usuario
    private List<DocumentReview> documentReviews = new ArrayList<>();

    // historial de acciones del trabajador sobre esta solicitud
    private List<ActionEntry> actionHistory = new ArrayList<>();

    // resumen del metodo de pago para revision del trabajador
    private PaymentSummary paymentSummary;

    // resumen del contrato firmado
    private ContractSummary contractSummary;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    public static class DocumentReview {
        private String documentKey;
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

    @Data
    public static class PaymentSummary {
        private String bankName;
        private String accountType;
        private String currency;
    }

    @Data
    public static class ContractSummary {
        private String signature;
        private String signedAt;
        private boolean accepted;
    }
}
