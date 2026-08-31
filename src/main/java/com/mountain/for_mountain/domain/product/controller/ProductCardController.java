package com.mountain.for_mountain.domain.product.controller;

import com.mountain.for_mountain.domain.product.dto.ProductCardOrderRequest;
import com.mountain.for_mountain.domain.product.dto.ProductCardRequest;
import com.mountain.for_mountain.domain.product.dto.ProductCardResponse;
import com.mountain.for_mountain.domain.product.service.ProductCardService;
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
@RequestMapping("/api/v1/product-cards")
@Tag(name = "Product Card API", description = "Product card management API")
public class ProductCardController {

    private final ProductCardService productCardService;

    @Operation(summary = "Get product cards")
    @GetMapping
    public ResponseEntity<List<ProductCardResponse>> getList() {
        return ResponseEntity.ok(productCardService.getList());
    }

    @Operation(summary = "Create product card", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<ProductCardResponse> create(@Valid @RequestBody ProductCardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productCardService.create(request));
    }

    @Operation(summary = "Update product card", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}")
    public ResponseEntity<ProductCardResponse> update(@PathVariable Long id, @Valid @RequestBody ProductCardRequest request) {
        return ResponseEntity.ok(productCardService.update(id, request));
    }

    @Operation(summary = "Reorder product cards", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/order")
    public ResponseEntity<List<ProductCardResponse>> reorder(@Valid @RequestBody ProductCardOrderRequest request) {
        return ResponseEntity.ok(productCardService.reorder(request));
    }

    @Operation(summary = "Delete product card", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productCardService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
