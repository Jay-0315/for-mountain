package com.mountain.for_mountain.domain.leave.repository;

import com.mountain.for_mountain.domain.leave.model.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {
    List<Leave> findAllByOrderByCreatedAtDesc();
    void deleteByEmployeeId(Long employeeId);
}
