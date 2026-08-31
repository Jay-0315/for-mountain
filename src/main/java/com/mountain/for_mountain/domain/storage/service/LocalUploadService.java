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
import java.util.UUID;

@Service
public class LocalUploadService {

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

    public Path resolve(String relativePath) {
        return Paths.get(uploadDir).resolve(relativePath);
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
}
