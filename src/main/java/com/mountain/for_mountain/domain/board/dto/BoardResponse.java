package com.mountain.for_mountain.domain.board.dto;

import com.mountain.for_mountain.domain.board.model.entity.Board;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Schema(description = "Board post detail response")
public class BoardResponse {

    @Schema(description = "Post ID", example = "1")
    private final Long id;

    @Schema(description = "Post title", example = "採用情報のお知らせ")
    private final String title;

    @Schema(description = "Post content", example = "2025年度の新卒採用を開始します...")
    private final String content;

    @Schema(description = "Author", example = "管理者")
    private final String author;

    @Schema(description = "Category", example = "採用")
    private final String category;

    @Schema(description = "Attached image file name", nullable = true)
    private final String imageName;

    @Schema(description = "Attached image data URL", nullable = true)
    private final String imageData;

    @Schema(description = "Attached video file name", nullable = true)
    private final String videoName;

    @Schema(description = "Attached video data URL", nullable = true)
    private final String videoData;

    @Schema(description = "Attached file name", nullable = true)
    private final String attachmentName;

    @Schema(description = "Attached file data URL", nullable = true)
    private final String attachmentData;

    @Schema(description = "Created timestamp")
    private final LocalDateTime createdAt;

    @Schema(description = "Last updated timestamp")
    private final LocalDateTime updatedAt;

    public BoardResponse(Board board) {
        this.id = board.getId();
        this.title = board.getTitle();
        this.content = board.getContent();
        this.author = board.getAuthor();
        this.category = board.getCategory();
        this.imageName = board.getImageName();
        this.imageData = board.getImageData();
        this.videoName = board.getVideoName();
        this.videoData = board.getVideoData();
        this.attachmentName = board.getAttachmentName();
        this.attachmentData = board.getAttachmentData();
        this.createdAt = board.getCreatedAt();
        this.updatedAt = board.getUpdatedAt();
    }
}
