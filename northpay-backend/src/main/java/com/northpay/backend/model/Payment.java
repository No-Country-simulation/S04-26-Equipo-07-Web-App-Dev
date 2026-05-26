package com.northpay.backend.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "payments")
@Data
public class Payment {

    @Id
    private String id;

    private String userId;

    private double amount;
    private String currency = "USD";

    // PENDING | ACCEPTED | CANCELLED
    private String status = "PENDING";

    private String stripePaymentIntentId;

    // clientSecret se envia al frontend para confirmar el pago con stripe.js
    private String stripeClientSecret;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
