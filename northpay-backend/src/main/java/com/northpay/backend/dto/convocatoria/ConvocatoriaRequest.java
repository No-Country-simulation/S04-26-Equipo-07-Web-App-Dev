package com.northpay.backend.dto.convocatoria;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class ConvocatoriaRequest {
    @NotBlank private String companyId;
    @NotBlank private String title;
    private String description;
    private String location;
    private String modality;
    private String contractType;
    private Double salaryMin;
    private Double salaryMax;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<String> technicalRequirements = new ArrayList<>();
    private List<String> questions = new ArrayList<>();
}
