package com.mountain.for_mountain.domain.storage.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.storage.config.S3Properties;
import com.mountain.for_mountain.domain.storage.dto.PresignedUploadRequest;
import com.mountain.for_mountain.domain.storage.dto.PresignedUploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3UploadService {

    private final S3Properties s3Properties;

    public PresignedUploadResponse createPresignedUpload(PresignedUploadRequest request) {
        validateConfiguration();

        String contentType = StringUtils.hasText(request.getContentType())
                ? request.getContentType().trim()
                : "application/octet-stream";
        String objectKey = buildObjectKey(request.getDirectory(), request.getFileName());

        try (S3Presigner presigner = S3Presigner.builder()
                .region(Region.of(s3Properties.getRegion()))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build()) {

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(s3Properties.getBucket())
                    .key(objectKey)
                    .contentType(contentType)
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(s3Properties.getUploadExpirationMinutes()))
                    .putObjectRequest(putObjectRequest)
                    .build();

            PresignedPutObjectRequest presignedRequest = presigner.presignPutObject(presignRequest);

            return new PresignedUploadResponse(
                    presignedRequest.url().toString(),
                    buildPublicUrl(objectKey),
                    objectKey,
                    Map.of("Content-Type", contentType)
            );
        } catch (RuntimeException exception) {
            throw new CustomException(ErrorCode.FILE_UPLOAD_PREPARE_FAILED);
        }
    }

    private void validateConfiguration() {
        if (!StringUtils.hasText(s3Properties.getRegion()) || !StringUtils.hasText(s3Properties.getBucket())) {
            throw new CustomException(ErrorCode.S3_NOT_CONFIGURED);
        }
    }

    private String buildObjectKey(String directory, String fileName) {
        String normalizedDirectory = normalizeDirectory(directory);
        String normalizedName = normalizeFileName(fileName);

        if (!StringUtils.hasText(normalizedName)) {
            throw new CustomException(ErrorCode.INVALID_UPLOAD_REQUEST);
        }

        return normalizedDirectory + "/" + LocalDate.now() + "/" + UUID.randomUUID() + "-" + normalizedName;
    }

    private String normalizeDirectory(String directory) {
        String value = StringUtils.hasText(directory) ? directory.trim().replace('\\', '/') : "uploads";
        value = value.replaceAll("/+", "/").replaceAll("^/|/$", "");
        value = value.replaceAll("[^a-zA-Z0-9/_-]", "");
        return StringUtils.hasText(value) ? value : "uploads";
    }

    private String normalizeFileName(String fileName) {
        String value = fileName == null ? "" : fileName.trim();
        value = value.replaceAll("\\s+", "-");
        value = value.replaceAll("[^a-zA-Z0-9._-]", "");
        return value;
    }

    private String buildPublicUrl(String objectKey) {
        if (StringUtils.hasText(s3Properties.getPublicBaseUrl())) {
            return s3Properties.getPublicBaseUrl().replaceAll("/+$", "") + "/" + encodeKey(objectKey);
        }
        return "https://" + s3Properties.getBucket() + ".s3." + s3Properties.getRegion() + ".amazonaws.com/" + encodeKey(objectKey);
    }

    private String encodeKey(String objectKey) {
        return URLEncoder.encode(objectKey, StandardCharsets.UTF_8)
                .replace("+", "%20")
                .replace("%2F", "/");
    }
}
