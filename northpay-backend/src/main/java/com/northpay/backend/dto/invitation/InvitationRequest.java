package com.northpay.backend.dto.invitation;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InvitationRequest {
    @NotBlank @Email
    private String email;
}
