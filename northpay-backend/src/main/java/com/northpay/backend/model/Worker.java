package com.northpay.backend.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "workers")
@Data
public class Worker {

    @Id
    private String id;

    private String firstName;
    private String lastName;

    private String email;

    private String password;

    // referencias a roles asignados a este trabajador
    private List<String> roleIds = new ArrayList<>();

    // active | inactive
    private String status = "active";

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
