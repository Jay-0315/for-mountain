package com.mountain.for_mountain.domain.group.repository;

import com.mountain.for_mountain.domain.group.model.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroupId(Long groupId);
    void deleteByGroupId(Long groupId);
    void deleteByEmployeeId(Long employeeId);
}
