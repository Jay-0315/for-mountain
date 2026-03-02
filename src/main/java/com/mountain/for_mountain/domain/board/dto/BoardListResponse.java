package com.mountain.for_mountain.domain.board.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Schema(description = "Paginated board post list response")
public class BoardListResponse {

    @Schema(description = "List of board posts")
    private List<BoardResponse> posts;

    @Schema(description = "Total number of posts", example = "42")
    private long totalElements;

    @Schema(description = "Total number of pages", example = "9")
    private int totalPages;

    @Schema(description = "Current page number (0-indexed)", example = "0")
    private int currentPage;

    @Schema(description = "Whether this is the last page", example = "false")
    private boolean last;
}
