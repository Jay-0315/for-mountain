package com.mountain.for_mountain.domain.lineworks.controller;

import com.mountain.for_mountain.domain.lineworks.dto.LineWorksDirectoryCompareResponse;
import com.mountain.for_mountain.domain.lineworks.dto.LineWorksSyncResponse;
import com.mountain.for_mountain.domain.lineworks.service.LineWorksDirectorySyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/lineworks")
@Tag(name = "LINE WORKS Sync API", description = "LINE WORKS directory synchronization API")
public class LineWorksSyncController {

    private final LineWorksDirectorySyncService lineWorksDirectorySyncService;

    @Operation(summary = "Synchronize LINE WORKS users and orgunits", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/sync/directory")
    public ResponseEntity<LineWorksSyncResponse> syncDirectory() {
        return ResponseEntity.ok(lineWorksDirectorySyncService.syncDirectory());
    }

    @Operation(summary = "Compare LINE WORKS users and orgunits without changing data", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/sync/directory/compare")
    public ResponseEntity<LineWorksDirectoryCompareResponse> compareDirectory() {
        return ResponseEntity.ok(lineWorksDirectorySyncService.compareDirectory());
    }
}
