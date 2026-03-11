package com.mountain.for_mountain.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
@Schema(description = "Create employee account request")
public class CreateEmployeeAccountRequest {

    @NotBlank(message = "Employee number must not be blank")
    @Schema(description = "Employee number (used as username)", example = "M26031025")
    private String employeeNumber;
}

