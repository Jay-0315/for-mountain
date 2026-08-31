package com.mountain.for_mountain.domain.storage.controller;

import com.mountain.for_mountain.domain.storage.service.LocalUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/uploads")
@Tag(name = "Upload API", description = "File upload API")
public class UploadController {

    private final LocalUploadService localUploadService;

    @Operation(
            summary = "Upload file",
            description = "Uploads a file to the server and returns the public URL.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("directory") String directory
    ) {
        String fileUrl = localUploadService.upload(file, directory);
        return ResponseEntity.ok(Map.of("fileUrl", fileUrl));
    }

    @GetMapping("/files/**")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        String relativePath = requestUri.replaceFirst(".*/api/v1/uploads/files/", "");

        Path filePath = localUploadService.resolve(relativePath);
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            String contentType = determineContentType(filePath.getFileName().toString());
            ResponseEntity.BodyBuilder response = ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    // 브라우저가 확장자를 보고 타입을 추측해 스크립트로 실행하지 못하게 한다.
                    .header("X-Content-Type-Options", "nosniff");
            // 이미지·동영상만 인라인 표시하고, 나머지는 내려받게 한다.
            if (!contentType.startsWith("image/") && !contentType.startsWith("video/")) {
                response = response.header("Content-Disposition", "attachment");
            }
            return response.body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private String determineContentType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".png"))  return "image/png";
        if (lower.endsWith(".gif"))  return "image/gif";
        if (lower.endsWith(".webp")) return "image/webp";
        // 동영상은 인라인 재생이 필요하므로 정확한 타입을 내려준다.
        if (lower.endsWith(".mp4"))  return "video/mp4";
        if (lower.endsWith(".webm")) return "video/webm";
        if (lower.endsWith(".mov"))  return "video/quicktime";
        if (lower.endsWith(".pdf"))  return "application/pdf";
        return "application/octet-stream";
    }
}
