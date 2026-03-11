package com.mountain.for_mountain.domain.notice.repository;

import com.mountain.for_mountain.domain.notice.model.entity.InternalAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternalAnnouncementRepository extends JpaRepository<InternalAnnouncement, Long> {
    List<InternalAnnouncement> findAllByOrderByCreatedAtDesc();
}
