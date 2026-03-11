package com.mountain.for_mountain.domain.notice.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.notice.dto.InternalAnnouncementRequest;
import com.mountain.for_mountain.domain.notice.dto.InternalAnnouncementResponse;
import com.mountain.for_mountain.domain.notice.model.entity.InternalAnnouncement;
import com.mountain.for_mountain.domain.notice.repository.InternalAnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InternalAnnouncementService {

    private final InternalAnnouncementRepository internalAnnouncementRepository;

    public List<InternalAnnouncementResponse> getList() {
        return internalAnnouncementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(InternalAnnouncementResponse::new)
                .toList();
    }

    @Transactional
    public InternalAnnouncementResponse create(InternalAnnouncementRequest request) {
        InternalAnnouncement announcement = InternalAnnouncement.create(
                request.getTitle(),
                request.getContent(),
                request.getAuthor(),
                request.isPinned()
        );
        return new InternalAnnouncementResponse(internalAnnouncementRepository.save(announcement));
    }

    @Transactional
    public InternalAnnouncementResponse update(Long id, InternalAnnouncementRequest request) {
        InternalAnnouncement announcement = internalAnnouncementRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.ACCESS_DENIED));
        announcement.update(
                request.getTitle(),
                request.getContent(),
                request.getAuthor(),
                request.isPinned()
        );
        return new InternalAnnouncementResponse(announcement);
    }

    @Transactional
    public void delete(Long id) {
        InternalAnnouncement announcement = internalAnnouncementRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.ACCESS_DENIED));
        internalAnnouncementRepository.delete(announcement);
    }
}
