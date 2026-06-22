package com.mountain.for_mountain.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
@Schema(description = "Password change request for a logged-in account")
public class PasswordChangeRequest {

    @NotBlank(message = "Current password must not be blank")
    @Schema(description = "Current password")
    private String currentPassword;

    @NotBlank(message = "New password must not be blank")
    @Schema(description = "New password", example = "my-new-password")
    private String newPassword;
}
