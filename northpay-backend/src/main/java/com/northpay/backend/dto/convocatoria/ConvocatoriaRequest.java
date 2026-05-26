package com.northpay.backend.dto.convocatoria;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConvocatoriaRequest {
    @NotBlank private String companyId;
    @NotBlank private String title;
    private String description;
    private String location;
    private String modality;
    private String contractType;
}
