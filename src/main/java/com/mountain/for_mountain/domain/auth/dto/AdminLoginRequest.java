package com.mountain.for_mountain.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@Schema(description = "Admin login request with username and password")
public class AdminLoginRequest {

    @NotBlank(message = "Username must not be blank")
    @Schema(description = "Admin username", example = "admin")
    private String username;

    @NotBlank(message = "Password must not be blank")
    @Schema(description = "Admin password", example = "change-me")
    private String password;
}
