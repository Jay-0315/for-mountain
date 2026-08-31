package com.mountain.for_mountain.domain.notice.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.notice.dto.DeptNoticeRequest;
import com.mountain.for_mountain.domain.notice.dto.DeptNoticeResponse;
import com.mountain.for_mountain.domain.notice.model.entity.DeptNotice;
import com.mountain.for_mountain.domain.notice.repository.DeptNoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeptNoticeService {

    private final DeptNoticeRepository deptNoticeRepository;

    public List<DeptNoticeResponse> getList(String department) {
        List<DeptNotice> notices;
        if (department != null && !department.isBlank()) {
            notices = deptNoticeRepository.findByDepartmentOrderByCreatedAtDesc(department);
        } else {
            notices = deptNoticeRepository.findAllByOrderByCreatedAtDesc();
        }

        return notices.stream()
                .map(DeptNoticeResponse::new)
                .toList();
    }

    @Transactional
    public DeptNoticeResponse create(DeptNoticeRequest request) {
        DeptNotice notice = DeptNotice.create(
                request.getDepartment(),
                request.getTitle(),
                request.getContent(),
                request.getAuthor()
        );
        return new DeptNoticeResponse(deptNoticeRepository.save(notice));
    }

    @Transactional
    public DeptNoticeResponse update(Long id, DeptNoticeRequest request) {
        DeptNotice notice = deptNoticeRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.DEPT_NOTICE_NOT_FOUND));
        notice.update(
                request.getDepartment(),
                request.getTitle(),
                request.getContent(),
                request.getAuthor()
        );
        return new DeptNoticeResponse(notice);
    }

    @Transactional
    public void delete(Long id) {
        DeptNotice notice = deptNoticeRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.DEPT_NOTICE_NOT_FOUND));
        deptNoticeRepository.delete(notice);
    }
}
