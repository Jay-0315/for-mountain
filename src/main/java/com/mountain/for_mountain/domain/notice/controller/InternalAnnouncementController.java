package com.mountain.for_mountain.domain.notice.controller;

import com.mountain.for_mountain.domain.notice.dto.InternalAnnouncementRequest;
import com.mountain.for_mountain.domain.notice.dto.InternalAnnouncementResponse;
import com.mountain.for_mountain.domain.notice.service.InternalAnnouncementService;
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
@RequestMapping("/api/v1/announcements")
@Tag(name = "Internal Announcement API", description = "Internal announcement API")
public class InternalAnnouncementController {

    private final InternalAnnouncementService internalAnnouncementService;

    @Operation(summary = "Get internal announcements")
    @GetMapping
    public ResponseEntity<List<InternalAnnouncementResponse>> getList() {
        return ResponseEntity.ok(internalAnnouncementService.getList());
    }

    @Operation(summary = "Create internal announcement", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<InternalAnnouncementResponse> create(@Valid @RequestBody InternalAnnouncementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(internalAnnouncementService.create(request));
    }

    @Operation(summary = "Update internal announcement", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}")
    public ResponseEntity<InternalAnnouncementResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody InternalAnnouncementRequest request
    ) {
        return ResponseEntity.ok(internalAnnouncementService.update(id, request));
    }

    @Operation(summary = "Delete internal announcement", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        internalAnnouncementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
