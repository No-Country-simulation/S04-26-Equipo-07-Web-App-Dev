package com.northpay.backend.dto.auth;

import com.northpay.backend.model.User;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.Data;

import java.time.LocalDate;

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
}
