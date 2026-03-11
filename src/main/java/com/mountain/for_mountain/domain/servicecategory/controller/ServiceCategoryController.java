package com.mountain.for_mountain.domain.servicecategory.controller;

import com.mountain.for_mountain.domain.servicecategory.dto.ServiceCategoryRequest;
import com.mountain.for_mountain.domain.servicecategory.dto.ServiceCategoryResponse;
import com.mountain.for_mountain.domain.servicecategory.service.ServiceCategoryService;
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
@RequestMapping("/api/v1/service-categories")
@Tag(name = "Service Category API", description = "Service category management API")
public class ServiceCategoryController {

    private final ServiceCategoryService serviceCategoryService;

    @Operation(summary = "Get service categories")
    @GetMapping
    public ResponseEntity<List<ServiceCategoryResponse>> getList() {
        return ResponseEntity.ok(serviceCategoryService.getList());
    }

    @Operation(summary = "Create service category", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<ServiceCategoryResponse> create(@Valid @RequestBody ServiceCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceCategoryService.create(request));
    }

    @Operation(summary = "Update service category", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}")
    public ResponseEntity<ServiceCategoryResponse> update(@PathVariable Long id, @Valid @RequestBody ServiceCategoryRequest request) {
        return ResponseEntity.ok(serviceCategoryService.update(id, request));
    }

    @Operation(summary = "Delete service category", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        serviceCategoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
