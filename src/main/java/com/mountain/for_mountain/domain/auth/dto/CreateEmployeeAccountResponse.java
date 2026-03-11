package com.mountain.for_mountain.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Schema(description = "Created employee account setup info")
public class CreateEmployeeAccountResponse {
    @Schema(description = "Employee username (employee number)", example = "M26031025")
    private String username;

    @Schema(description = "One-time setup token", example = "d5e9dfb8f12f4bb0ab2e3aef523a70ce")
    private String setupToken;

    @Schema(description = "Token expiration time")
    private LocalDateTime setupTokenExpiresAt;
}

