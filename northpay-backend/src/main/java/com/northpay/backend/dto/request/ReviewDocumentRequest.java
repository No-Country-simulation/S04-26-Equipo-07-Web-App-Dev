package com.northpay.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReviewDocumentRequest {
    private String documentKey;
    // APPROVED | REJECTED
    @NotBlank
    private String status;
    private String observation;
}
