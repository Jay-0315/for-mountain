package com.mountain.for_mountain.domain.board.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.board.dto.*;
import com.mountain.for_mountain.domain.board.model.entity.Board;
import com.mountain.for_mountain.domain.board.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {

    private final BoardRepository boardRepository;

    public BoardListResponse getList(int page, int size, String category) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Board> boardPage;

        if (category != null && !category.isBlank()) {
            boardPage = boardRepository.findByCategoryOrderByCreatedAtDesc(category, pageable);
        } else {
            boardPage = boardRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        List<BoardResponse> posts = boardPage.getContent().stream()
                .map(BoardResponse::new)
                .toList();

        return new BoardListResponse(
                posts,
                boardPage.getTotalElements(),
                boardPage.getTotalPages(),
                boardPage.getNumber(),
                boardPage.isLast()
        );
    }

    public BoardResponse getDetail(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.BOARD_NOT_FOUND));
        return new BoardResponse(board);
    }

    @Transactional
    public BoardResponse create(BoardCreateRequest request) {
        Board board = new Board(
                request.getTitle(),
                request.getContent(),
                request.getAuthor(),
                request.getCategory()
        );
        return new BoardResponse(boardRepository.save(board));
    }

    @Transactional
    public BoardResponse update(Long id, BoardUpdateRequest request) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.BOARD_NOT_FOUND));
        board.update(request.getTitle(), request.getContent(), request.getCategory());
        return new BoardResponse(board);
    }

    @Transactional
    public void delete(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.BOARD_NOT_FOUND));
        boardRepository.delete(board);
    }
}
