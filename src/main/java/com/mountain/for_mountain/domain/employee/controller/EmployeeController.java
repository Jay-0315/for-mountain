package com.mountain.for_mountain.domain.employee.controller;

import com.mountain.for_mountain.domain.employee.dto.EmployeeRequest;
import com.mountain.for_mountain.domain.employee.dto.EmployeeResponse;
import com.mountain.for_mountain.domain.employee.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/api/v1/employees")
@Tag(name = "Employee API", description = "Employee management API")
public class EmployeeController {

    private final EmployeeService employeeService;

    @Operation(summary = "Get employees")
    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getList(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(employeeService.getList(status, department, keyword));
    }

    @Operation(summary = "Create employee", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<EmployeeResponse> create(@Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.create(request));
    }

    @Operation(summary = "Update employee", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> update(@PathVariable Long id, @Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(employeeService.update(id, request));
    }

    @Operation(summary = "Delete employee", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
