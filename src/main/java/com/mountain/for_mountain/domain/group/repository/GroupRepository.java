package com.mountain.for_mountain.domain.group.repository;

import com.mountain.for_mountain.domain.group.model.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findAllByOrderByCreatedAtAsc();
    List<Group> findByLeaderId(Long leaderId);
    Optional<Group> findByName(String name);
}
