package com.northpay.backend.dto.module;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateModuleRequest {
    @NotBlank private String title;
    private String description;
    @NotBlank private String path;
    private String icon;
    // sistema | gestion | usuario
    @NotBlank private String group;
    private int order;
}
