package com.mountain.for_mountain.domain.serviceitem.controller;

import com.mountain.for_mountain.domain.serviceitem.dto.ServiceItemRequest;
import com.mountain.for_mountain.domain.serviceitem.dto.ServiceItemResponse;
import com.mountain.for_mountain.domain.serviceitem.service.ServiceItemService;
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
@RequestMapping("/api/v1/service-items")
@Tag(name = "Service Item API", description = "Service area content management API")
public class ServiceItemController {

    private final ServiceItemService serviceItemService;

    @Operation(summary = "Get service items")
    @GetMapping
    public ResponseEntity<List<ServiceItemResponse>> getList(
            @Parameter(description = "Category filter", example = "solutions")
            @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(serviceItemService.getList(category));
    }

    @Operation(summary = "Get service item detail")
    @GetMapping("/{id}")
    public ResponseEntity<ServiceItemResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(serviceItemService.getDetail(id));
    }

    @Operation(summary = "Create service item", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<ServiceItemResponse> create(@Valid @RequestBody ServiceItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceItemService.create(request));
    }

    @Operation(summary = "Update service item", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}")
    public ResponseEntity<ServiceItemResponse> update(@PathVariable Long id, @Valid @RequestBody ServiceItemRequest request) {
        return ResponseEntity.ok(serviceItemService.update(id, request));
    }

    @Operation(summary = "Delete service item", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        serviceItemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
