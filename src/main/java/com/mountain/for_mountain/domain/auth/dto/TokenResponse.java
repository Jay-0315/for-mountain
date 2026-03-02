package com.mountain.for_mountain.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Schema(description = "JWT token response")
public class TokenResponse {

    @Schema(description = "Bearer JWT token", example = "eyJhbGci...")
    private String token;

    @Schema(description = "Token type", example = "Bearer")
    private String tokenType;
}
