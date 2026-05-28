package com.northpay.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SetPasswordRequest {

    @NotBlank
    private String token;

    // min 8 chars, 1 mayuscula, 1 minuscula, 1 numero, 1 especial
    @NotBlank
    @Size(min = 8, message = "la contrasena debe tener al menos 8 caracteres")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).+$",
        message = "la contrasena debe contener mayusculas, minusculas, numeros y un caracter especial"
    )
    private String password;

    @NotBlank
    private String confirmPassword;
}
