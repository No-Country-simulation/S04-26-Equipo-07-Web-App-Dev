package com.northpay.backend.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String type;
    private double credits;
}
