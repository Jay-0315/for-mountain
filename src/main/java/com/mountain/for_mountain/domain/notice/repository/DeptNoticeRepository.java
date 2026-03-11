package com.mountain.for_mountain.domain.notice.repository;

import com.mountain.for_mountain.domain.notice.model.entity.DeptNotice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeptNoticeRepository extends JpaRepository<DeptNotice, Long> {

    List<DeptNotice> findAllByOrderByCreatedAtDesc();

    List<DeptNotice> findByDepartmentOrderByCreatedAtDesc(String department);
}
