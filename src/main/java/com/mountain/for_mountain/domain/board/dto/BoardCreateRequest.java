package com.mountain.for_mountain.domain.board.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@Schema(description = "Request body for creating a board post")
public class BoardCreateRequest {

    @NotBlank(message = "Title must not be blank")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    @Schema(description = "Post title", example = "採用情報のお知らせ")
    private String title;

    @NotBlank(message = "Content must not be blank")
    @Schema(description = "Post content", example = "2025年度の新卒採用を開始します...")
    private String content;

    @NotBlank(message = "Author must not be blank")
    @Size(max = 100, message = "Author must not exceed 100 characters")
    @Schema(description = "Author name", example = "管理者")
    private String author;

    @NotBlank(message = "Category must not be blank")
    @Size(max = 50)
    @Schema(description = "Category", example = "採用", allowableValues = {"お知らせ", "会社", "採用", "製品"})
    private String category;
}
