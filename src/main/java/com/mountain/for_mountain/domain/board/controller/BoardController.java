package com.mountain.for_mountain.domain.board.controller;

import com.mountain.for_mountain.domain.board.dto.*;
import com.mountain.for_mountain.domain.board.service.BoardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/board")
@Tag(name = "Board API", description = "Board / News Bulletin Board API")
public class BoardController {

    private final BoardService boardService;

    @Operation(summary = "Get board post list", description = "Returns paginated list of board posts. Optional category filter.")
    @GetMapping
    public ResponseEntity<BoardListResponse> getList(
            @Parameter(description = "Page number (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Category filter (optional)", example = "採用")
            @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(boardService.getList(page, size, category));
    }

    @Operation(summary = "Get board post detail", description = "Returns a single board post by ID.")
    @GetMapping("/{id}")
    public ResponseEntity<BoardResponse> getDetail(
            @Parameter(description = "Board post ID", example = "1")
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(boardService.getDetail(id));
    }

    @Operation(
        summary = "Create board post",
        description = "Creates a new board post. Requires JWT Bearer token.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping
    public ResponseEntity<BoardResponse> create(@Valid @RequestBody BoardCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(boardService.create(request));
    }

    @Operation(
        summary = "Update board post",
        description = "Updates an existing board post. Requires JWT Bearer token.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @PutMapping("/{id}")
    public ResponseEntity<BoardResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody BoardUpdateRequest request
    ) {
        return ResponseEntity.ok(boardService.update(id, request));
    }

    @Operation(
        summary = "Delete board post",
        description = "Deletes a board post. Requires JWT Bearer token.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boardService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
