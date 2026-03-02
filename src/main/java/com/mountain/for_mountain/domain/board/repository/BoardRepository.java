package com.mountain.for_mountain.domain.board.repository;

import com.mountain.for_mountain.domain.board.model.entity.Board;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {

    Page<Board> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Board> findByCategoryOrderByCreatedAtDesc(String category, Pageable pageable);
}
