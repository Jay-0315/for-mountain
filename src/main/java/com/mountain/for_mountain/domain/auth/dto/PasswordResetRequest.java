package com.mountain.for_mountain.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
@Schema(description = "Password reset request (sends a reset link by email)")
public class PasswordResetRequest {

    @NotBlank(message = "Username must not be blank")
    @Schema(description = "Employee username (employee number)", example = "M24101017")
    private String username;
}
