package com.northpay.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReviewInformationRequest {
    private String field;
    // APPROVED | REJECTED
    @NotBlank
    private String status;
    private String observation;
}
