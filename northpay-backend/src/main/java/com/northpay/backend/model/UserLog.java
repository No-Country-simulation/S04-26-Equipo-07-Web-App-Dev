package com.northpay.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "user_logs")
@Data
public class UserLog {
    @Id
    private String id;
    private String userId;
    private String action;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp = LocalDateTime.now();
}
