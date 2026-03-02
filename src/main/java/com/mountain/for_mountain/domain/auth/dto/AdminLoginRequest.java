package com.mountain.for_mountain.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@Schema(description = "Admin login request with secret code")
public class AdminLoginRequest {

    @NotBlank(message = "Admin code must not be blank")
    @Schema(description = "Admin secret code", example = "mountain-admin-2024")
    private String code;
}
