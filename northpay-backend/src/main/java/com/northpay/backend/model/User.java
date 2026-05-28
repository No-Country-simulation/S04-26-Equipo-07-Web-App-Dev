package com.northpay.backend.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "users")
@Data
public class User {

    @Id
    private String id;

    private String firstName;
    private String lastName;

    private DocumentInfo document;

    @Indexed(unique = true)
    private String email;

    private String phone;
    private LocalDate birthDate;

    // un usuario puede pertenecer a varias empresas
    private List<String> companyIds = new ArrayList<>();

    private Address address;

    // active | inactive | pending | pending_password
    private String status;

    private String password;

    private double credits = 0.0;

    // documentos subidos al onboarding: clave = tipo, valor = url cloudinary
    private Map<String, String> documents = new HashMap<>();

    // metodo de cobro configurado durante el onboarding
    private PaymentInfo paymentInfo;

    // info del contrato firmado
    private ContractInfo contractInfo;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    public static class DocumentInfo {
        private String type;
        private String number;
    }

    @Data
    public static class Address {
        private String country;
        private String city;
        private String street;
    }

    @Data
    public static class PaymentInfo {
        private String bankName;
        private String accountType;
        private String accountNumber;
        private String routingNumber;
        private String currency;
    }

    @Data
    public static class ContractInfo {
        private String signature;
        private String signedAt;
        private boolean accepted;
    }
}
