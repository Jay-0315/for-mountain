package com.mountain.for_mountain.domain.notice.controller;

import com.mountain.for_mountain.domain.notice.dto.DeptNoticeRequest;
import com.mountain.for_mountain.domain.notice.dto.DeptNoticeResponse;
import com.mountain.for_mountain.domain.notice.service.DeptNoticeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/dept-notices")
@Tag(name = "Department Notice API", description = "Department-specific notice API")
public class DeptNoticeController {

    private final DeptNoticeService deptNoticeService;

    @Operation(summary = "Get department notices", description = "Returns department notices. Optional department filter.")
    @GetMapping
    public ResponseEntity<List<DeptNoticeResponse>> getList(
            @Parameter(description = "Department filter (optional)", example = "開発 Part1")
            @RequestParam(required = false) String department
    ) {
        return ResponseEntity.ok(deptNoticeService.getList(department));
    }

    @Operation(
            summary = "Create department notice",
            description = "Creates a department notice. Requires JWT Bearer token.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping
    public ResponseEntity<DeptNoticeResponse> create(@Valid @RequestBody DeptNoticeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deptNoticeService.create(request));
    }

    @Operation(
            summary = "Update department notice",
            description = "Updates a department notice. Requires JWT Bearer token.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PutMapping("/{id}")
    public ResponseEntity<DeptNoticeResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody DeptNoticeRequest request
    ) {
        return ResponseEntity.ok(deptNoticeService.update(id, request));
    }

    @Operation(
            summary = "Delete department notice",
            description = "Deletes a department notice. Requires JWT Bearer token.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deptNoticeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
