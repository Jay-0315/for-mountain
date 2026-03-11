package com.mountain.for_mountain.domain.notice.dto;

import com.mountain.for_mountain.domain.notice.model.entity.DeptNotice;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Schema(description = "Department notice response")
public class DeptNoticeResponse {

    @Schema(description = "Notice ID", example = "1")
    private final Long id;

    @Schema(description = "Target department", example = "開発 Part1")
    private final String department;

    @Schema(description = "Notice title", example = "コードレビュー運用ルール変更のお知らせ")
    private final String title;

    @Schema(description = "Notice content")
    private final String content;

    @Schema(description = "Author", example = "申尚勲")
    private final String author;

    @Schema(description = "Created timestamp")
    private final LocalDateTime createdAt;

    @Schema(description = "Last updated timestamp")
    private final LocalDateTime updatedAt;

    public DeptNoticeResponse(DeptNotice notice) {
        this.id = notice.getId();
        this.department = notice.getDepartment();
        this.title = notice.getTitle();
        this.content = notice.getContent();
        this.author = notice.getAuthor();
        this.createdAt = notice.getCreatedAt();
        this.updatedAt = notice.getUpdatedAt();
    }
}
