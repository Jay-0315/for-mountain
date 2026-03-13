package com.mountain.for_mountain.domain.board.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@Schema(description = "Request body for updating a board post")
public class BoardUpdateRequest {

    @NotBlank(message = "Title must not be blank")
    @Size(max = 200)
    @Schema(description = "Updated title", example = "採用情報更新")
    private String title;

    @NotBlank(message = "Content must not be blank")
    @Schema(description = "Updated content", example = "内容を更新しました...")
    private String content;

    @NotBlank(message = "Category must not be blank")
    @Size(max = 50)
    @Schema(description = "Updated category", example = "お知らせ")
    private String category;

    @Size(max = 255)
    @Schema(description = "Attached image file name", nullable = true)
    private String imageName;

    @Schema(description = "Attached image data URL", nullable = true)
    private String imageData;

    @Size(max = 255)
    @Schema(description = "Attached video file name", nullable = true)
    private String videoName;

    @Schema(description = "Attached video data URL", nullable = true)
    private String videoData;

    @Size(max = 255)
    @Schema(description = "Attached file name", nullable = true)
    private String attachmentName;

    @Schema(description = "Attached file data URL", nullable = true)
    private String attachmentData;
}
