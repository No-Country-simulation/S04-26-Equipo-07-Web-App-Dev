package com.northpay.backend.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "invitations")
@Data
public class Invitation {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    @Indexed(unique = true)
    private String token;

    // pending | used | expired
    private String status = "pending";

    private String invitedBy;

    // expira a las 48 horas de ser creada
    private LocalDateTime expiresAt;

    @CreatedDate
    private LocalDateTime createdAt;
}
