package com.northpay.backend.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "companies")
@Data
public class Company {

    @Id
    private String id;

    private String name;
    private String tradeName;
    private String taxId;
    private String country;
    private String industry;
    private String website;

    private Address address;
    private Contact contact;

    // active | inactive
    private String status = "active";

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    public static class Address {
        private String street;
        private String city;
        private String state;
        private String postalCode;
    }

    @Data
    public static class Contact {
        private String email;
        private String phone;
    }
}
