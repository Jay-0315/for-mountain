package com.mountain.for_mountain.domain.auth.controller;

import com.mountain.for_mountain.domain.auth.dto.AdminLoginRequest;
import com.mountain.for_mountain.domain.auth.dto.PasswordSetupRequest;
import com.mountain.for_mountain.domain.auth.dto.TokenResponse;
import com.mountain.for_mountain.domain.auth.service.AccountManagementService;
import com.mountain.for_mountain.domain.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
}
