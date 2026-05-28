package com.northpay.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Map;
import java.util.HashMap;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Document(collection = "contractors")
@Data // Esto genera los getters y setters automáticamente
public class Contractor {
    @Id
    private String id;
    @NotBlank(message = "El nombre completo es obligatorio")
    private String fullName;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El correo electrónico no es válido")
    private String email;

    @NotBlank(message = "El país es obligatorio")
    private String country;
    private String phone;
    private String phoneCode;
    private String dateOfBirth;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String signature;
    private String signedAt;
    private String status; // Ej: "PENDING", "APPROVED", "REJECTED"

    // Aquí guardaremos las URLs de Cloudinary
    // Ejemplo: {"dni": "https://...", "tax_id": "https://..."}
    private Map<String, String> documents = new HashMap<>();

    private boolean contractSigned = false;

    // Aquí guardaremos los detalles del método de pago
    // Ejemplo: {"bankName": "BCP", "accountNumber": "123456789", "type": "Ahorros"}
    private Map<String, String> paymentMethod = new HashMap<>();
}