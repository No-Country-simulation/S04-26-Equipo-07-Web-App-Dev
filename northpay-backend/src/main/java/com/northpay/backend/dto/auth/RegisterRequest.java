package com.northpay.backend.dto.auth;

import com.northpay.backend.model.User;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.Data;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Data
public class RegisterRequest {

    @NotBlank
    private String invitationToken;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank @Email
    private String email;

    @NotBlank
    private String phone;

    @NotNull @Past
    private LocalDate birthDate;

    @Valid @NotNull
    private User.DocumentInfo document;

    @Valid @NotNull
    private User.Address address;

    // documentos subidos: clave = tipo (id/address/tax), valor = URL cloudinary
    private Map<String, String> documentUrls = new HashMap<>();

    // contrato firmado electronicamente
    private String contractSignature;
    private String contractSignedAt;

    // metodo de cobro configurado durante el onboarding
    private PaymentInfo paymentInfo;

    @Data
    public static class PaymentInfo {
        private String bankName;
        private String accountType;
        private String accountNumber;
        private String routingNumber;
        private String currency;
    }
}
