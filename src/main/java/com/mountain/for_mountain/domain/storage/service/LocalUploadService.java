package com.mountain.for_mountain.domain.storage.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class LocalUploadService {

    /**
     * 업로드를 허용하는 확장자.
     * 관리자만 업로드할 수 있지만, 계정이 탈취됐을 때 임의 파일이 서버에 올라가
     * API 오리진에서 그대로 서빙되는 것을 막기 위해 화이트리스트로 제한한다.
     * (특히 .html/.svg 는 저장형 XSS 로 이어질 수 있어 제외한다.)
     */
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            // images
            "jpg", "jpeg", "png", "gif", "webp",
            // videos
            "mp4", "webm", "mov",
            // documents
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv", "txt", "zip"
    );

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public String upload(MultipartFile file, String directory) {
        if (file == null || file.isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_UPLOAD_REQUEST);
        }

        String normalizedDir  = normalizeDirectory(directory);
        String normalizedName = normalizeFileName(file.getOriginalFilename());
        if (!StringUtils.hasText(normalizedName)) {
            throw new CustomException(ErrorCode.INVALID_UPLOAD_REQUEST);
        }
        if (!ALLOWED_EXTENSIONS.contains(extensionOf(normalizedName))) {
            throw new CustomException(ErrorCode.INVALID_UPLOAD_REQUEST);
        }

        String filename = UUID.randomUUID() + "-" + normalizedName;
        Path dirPath = Paths.get(uploadDir, normalizedDir, LocalDate.now().toString());

        try {
            Files.createDirectories(dirPath);
            file.transferTo(dirPath.resolve(filename));
        } catch (IOException e) {
            throw new CustomException(ErrorCode.FILE_UPLOAD_PREPARE_FAILED);
        }

        // 프론트 rewrite: /uploads/** → backend /api/v1/uploads/files/**
        return "/uploads/" + normalizedDir + "/" + LocalDate.now() + "/" + filename;
    }

    /**
     * 업로드 루트 기준으로 경로를 해석한다.
     * 정규화 후에도 루트를 벗어나면 거부해 경로 탈출(../)을 막는다.
     */
    public Path resolve(String relativePath) {
        Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path resolved = root.resolve(relativePath == null ? "" : relativePath)
                .toAbsolutePath()
                .normalize();
        if (!resolved.startsWith(root)) {
            throw new CustomException(ErrorCode.INVALID_UPLOAD_REQUEST);
        }
        return resolved;
    }

    private String normalizeDirectory(String directory) {
        String value = StringUtils.hasText(directory) ? directory.trim().replace('\\', '/') : "uploads";
        value = value.replaceAll("/+", "/").replaceAll("^/|/$", "");
        value = value.replaceAll("[^a-zA-Z0-9/_-]", "");
        return StringUtils.hasText(value) ? value : "uploads";
    }

    private String extensionOf(String fileName) {
        int dot = fileName.lastIndexOf('.');
        if (dot < 0 || dot == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private String normalizeFileName(String fileName) {
        String value = fileName == null ? "" : fileName.trim();
        value = value.replaceAll("\\s+", "-");
        value = value.replaceAll("[^a-zA-Z0-9._-]", "");
        return value;
    }
}
