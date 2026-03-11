package com.mountain.for_mountain.domain.employee.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
@Schema(description = "Request body for creating or updating an employee")
public class EmployeeRequest {

    @NotBlank
    @Size(max = 20)
    private String employeeNumber;

    @NotBlank
    @Size(max = 50)
    private String name;

    @NotBlank
    @Size(max = 100)
    private String nameKana;

    @NotBlank
    @Size(max = 50)
    private String nationality;

    @NotBlank
    private String birthDate;

    @NotBlank
    @Size(max = 50)
    private String department;

    @NotBlank
    @Size(max = 30)
    private String position;

    @NotBlank
    @Size(max = 30)
    private String jobTitle;

    @NotBlank
    private String joinDate;

    @NotBlank
    @Size(max = 100)
    private String email;

    @NotBlank
    @Size(max = 10)
    private String status;
}
