package com.mountain.for_mountain.domain.notice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
@Schema(description = "Request body for creating or updating a department notice")
public class DeptNoticeRequest {

    @NotBlank(message = "Department must not be blank")
    @Size(max = 50, message = "Department must not exceed 50 characters")
    @Schema(description = "Target department or 全部署", example = "開発 Part1")
    private String department;

    @NotBlank(message = "Title must not be blank")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    @Schema(description = "Department notice title", example = "コードレビュー運用ルール変更のお知らせ")
    private String title;

    @NotBlank(message = "Content must not be blank")
    @Schema(description = "Department notice content")
    private String content;

    @NotBlank(message = "Author must not be blank")
    @Size(max = 100, message = "Author must not exceed 100 characters")
    @Schema(description = "Notice author", example = "申尚勲")
    private String author;
}
