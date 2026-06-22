package com.mountain.for_mountain.domain.auth.controller;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.auth.dto.AdminLoginRequest;
import com.mountain.for_mountain.domain.auth.dto.PasswordChangeRequest;
import com.mountain.for_mountain.domain.auth.dto.PasswordResetRequest;
import com.mountain.for_mountain.domain.auth.dto.PasswordSetupRequest;
import com.mountain.for_mountain.domain.auth.dto.TokenResponse;
import com.mountain.for_mountain.domain.auth.service.AccountManagementService;
import com.mountain.for_mountain.domain.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
@Tag(name = "Auth API", description = "Admin Authentication API")
public class AuthController {

    private final AuthService authService;
    private final AccountManagementService accountManagementService;

    @Operation(
        summary = "Admin Login",
        description = "Submit admin username/password to receive a JWT token for authenticated operations"
    )
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(
            summary = "Set initial password",
            description = "Set password for a newly created employee account using one-time setup token"
    )
    @PostMapping("/password/setup")
    public ResponseEntity<Map<String, Boolean>> setupPassword(@Valid @RequestBody PasswordSetupRequest request) {
        accountManagementService.setupPassword(
                request.getUsername(),
                request.getSetupToken(),
                request.getNewPassword()
        );
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @Operation(
            summary = "Request password reset",
            description = "Send a password reset link to the account's registered email"
    )
    @PostMapping("/password/reset-request")
    public ResponseEntity<Map<String, Boolean>> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        accountManagementService.requestPasswordReset(request.getUsername());
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @Operation(
            summary = "Change password",
            description = "Change the password for the currently authenticated account"
    )
    @PostMapping("/password/change")
    public ResponseEntity<Map<String, Boolean>> changePassword(
            @Valid @RequestBody PasswordChangeRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new CustomException(ErrorCode.MISSING_TOKEN);
        }
        accountManagementService.changePassword(
                authentication.getName(),
                request.getCurrentPassword(),
                request.getNewPassword()
        );
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
