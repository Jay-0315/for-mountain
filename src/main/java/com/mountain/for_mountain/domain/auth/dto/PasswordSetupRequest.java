package com.mountain.for_mountain.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
@Schema(description = "Password setup request for employee account")
public class PasswordSetupRequest {

    @NotBlank(message = "Username must not be blank")
    @Schema(description = "Employee username (employee number)", example = "M26031025")
    private String username;

    @NotBlank(message = "Setup token must not be blank")
    @Schema(description = "One-time setup token")
    private String setupToken;

    @NotBlank(message = "New password must not be blank")
    @Schema(description = "New password", example = "my-secure-password")
    private String newPassword;
}

