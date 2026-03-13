package com.mountain.for_mountain.domain.storage.controller;

import com.mountain.for_mountain.domain.storage.dto.PresignedUploadRequest;
import com.mountain.for_mountain.domain.storage.dto.PresignedUploadResponse;
import com.mountain.for_mountain.domain.storage.service.S3UploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/uploads")
@Tag(name = "Upload API", description = "Presigned upload URL API")
public class UploadController {

    private final S3UploadService s3UploadService;

    @Operation(
            summary = "Create presigned upload URL",
            description = "Creates a presigned S3 PUT URL for browser direct upload.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/presign")
    public ResponseEntity<PresignedUploadResponse> createPresignedUpload(
            @Valid @RequestBody PresignedUploadRequest request
    ) {
        return ResponseEntity.ok(s3UploadService.createPresignedUpload(request));
    }
}
