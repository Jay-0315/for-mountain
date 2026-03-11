package com.mountain.for_mountain.domain.partner.controller;

import com.mountain.for_mountain.domain.partner.dto.PartnerCardRequest;
import com.mountain.for_mountain.domain.partner.dto.PartnerCardResponse;
import com.mountain.for_mountain.domain.partner.service.PartnerCardService;
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
@RequestMapping("/api/v1/partner-cards")
@Tag(name = "Partner Card API", description = "Partner card management API")
public class PartnerCardController {

    private final PartnerCardService partnerCardService;

    @Operation(summary = "Get partner cards")
    @GetMapping
    public ResponseEntity<List<PartnerCardResponse>> getList() {
        return ResponseEntity.ok(partnerCardService.getList());
    }

    @Operation(summary = "Create partner card", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<PartnerCardResponse> create(@Valid @RequestBody PartnerCardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(partnerCardService.create(request));
    }

    @Operation(summary = "Update partner card", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}")
    public ResponseEntity<PartnerCardResponse> update(@PathVariable Long id, @Valid @RequestBody PartnerCardRequest request) {
        return ResponseEntity.ok(partnerCardService.update(id, request));
    }

    @Operation(summary = "Delete partner card", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        partnerCardService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
