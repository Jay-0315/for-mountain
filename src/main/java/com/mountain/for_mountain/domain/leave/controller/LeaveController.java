package com.mountain.for_mountain.domain.leave.controller;

import com.mountain.for_mountain.domain.leave.dto.LeaveCreateRequest;
import com.mountain.for_mountain.domain.leave.dto.LeaveResponse;
import com.mountain.for_mountain.domain.leave.dto.LeaveStatusUpdateRequest;
import com.mountain.for_mountain.domain.leave.dto.LeaveUpdateRequest;
import com.mountain.for_mountain.domain.leave.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/leaves")
@Tag(name = "Leave API", description = "Leave management API")
public class LeaveController {

    private final LeaveService leaveService;

    @Operation(summary = "Get leaves")
    @GetMapping
    public ResponseEntity<List<LeaveResponse>> getList(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String department,
            Authentication authentication
    ) {
        return ResponseEntity.ok(leaveService.getList(status, department, authentication));
    }

    @Operation(summary = "Create leave", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<LeaveResponse> create(@Valid @RequestBody LeaveCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leaveService.create(request));
    }

    @Operation(summary = "Update own pending leave", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}")
    public ResponseEntity<LeaveResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody LeaveUpdateRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(leaveService.updateOwnPendingLeave(id, request, authentication.getName()));
    }

    @Operation(summary = "Update leave status", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/{id}/status")
    public ResponseEntity<LeaveResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody LeaveStatusUpdateRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(leaveService.updateStatus(id, request.getStatus(), authentication));
    }

    @Operation(summary = "Cancel own pending leave", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id, Authentication authentication) {
        leaveService.cancelOwnPendingLeave(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
