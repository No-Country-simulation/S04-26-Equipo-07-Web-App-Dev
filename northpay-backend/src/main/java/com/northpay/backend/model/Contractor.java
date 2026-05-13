package com.northpay.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Map;
import java.util.HashMap;

@Document(collection = "contractors")
@Data // Esto genera los getters y setters automáticamente
public class Contractor {
    @Id
    private String id;
    private String fullName;
    private String email;
    private String country;
    private String status; // Ej: "PENDING", "APPROVED", "REJECTED"

    // Aquí guardaremos las URLs de Cloudinary
    // Ejemplo: {"dni": "https://...", "tax_id": "https://..."}
    private Map<String, String> documents = new HashMap<>();

    private boolean contractSigned = false;

    // Aquí guardaremos los detalles del método de pago
    // Ejemplo: {"bankName": "BCP", "accountNumber": "123456789", "type": "Ahorros"}
    private Map<String, String> paymentMethod = new HashMap<>();
}