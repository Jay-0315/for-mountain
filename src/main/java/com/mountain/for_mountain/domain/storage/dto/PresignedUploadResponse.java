package com.mountain.for_mountain.domain.storage.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@Getter
@AllArgsConstructor
@Schema(description = "Presigned S3 upload response")
public class PresignedUploadResponse {

    @Schema(description = "Presigned PUT URL")
    private String uploadUrl;

    @Schema(description = "Public file URL after upload")
    private String fileUrl;

    @Schema(description = "Stored object key")
    private String objectKey;

    @Schema(description = "Headers required for the PUT request")
    private Map<String, String> headers;
}
