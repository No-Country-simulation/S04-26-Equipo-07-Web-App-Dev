package com.northpay.backend.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "password_setup_tokens")
@Data
public class PasswordSetupToken {

    @Id
    private String id;

    private String userId;

    @Indexed(unique = true)
    private String token;

    private boolean used = false;

    // expira a las 72 horas
    private LocalDateTime expiresAt;

    @CreatedDate
    private LocalDateTime createdAt;
}
