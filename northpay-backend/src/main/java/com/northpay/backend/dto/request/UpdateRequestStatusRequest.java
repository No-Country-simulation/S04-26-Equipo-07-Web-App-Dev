package com.northpay.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateRequestStatusRequest {
    // IN_REVIEW | APPROVED | REJECTED
    @NotBlank
    private String status;
    private String notes;
}
