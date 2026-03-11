package com.mountain.for_mountain.domain.auth.controller;

import com.mountain.for_mountain.domain.auth.dto.CreateEmployeeAccountRequest;
import com.mountain.for_mountain.domain.auth.dto.CreateEmployeeAccountResponse;
import com.mountain.for_mountain.domain.auth.service.AccountManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/accounts")
@Tag(name = "Admin Account API", description = "Admin-only account management API")
public class AdminAccountController {

    private final AccountManagementService accountManagementService;

    @Operation(
            summary = "Create employee account",
            description = "Create a new employee account with employee number as username and issue setup token.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping
    public ResponseEntity<CreateEmployeeAccountResponse> createEmployeeAccount(
            @Valid @RequestBody CreateEmployeeAccountRequest request
    ) {
        CreateEmployeeAccountResponse response =
                accountManagementService.createEmployeeAccount(request.getEmployeeNumber());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

