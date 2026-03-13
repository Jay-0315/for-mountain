package com.mountain.for_mountain.domain.storage.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
@Schema(description = "Request body for preparing an S3 presigned upload")
public class PresignedUploadRequest {

    @NotBlank(message = "fileName must not be blank")
    @Schema(description = "Original file name", example = "company-profile.pdf")
    private String fileName;

    @NotBlank(message = "contentType must not be blank")
    @Schema(description = "MIME type", example = "application/pdf")
    private String contentType;

    @NotBlank(message = "directory must not be blank")
    @Schema(description = "Upload directory prefix", example = "board/attachments")
    private String directory;
}
