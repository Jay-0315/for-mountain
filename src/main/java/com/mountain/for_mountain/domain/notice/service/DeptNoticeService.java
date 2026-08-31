package com.mountain.for_mountain.domain.notice.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.employee.model.entity.Employee;
import com.mountain.for_mountain.domain.employee.repository.EmployeeRepository;
import com.mountain.for_mountain.domain.notice.dto.DeptNoticeRequest;
import com.mountain.for_mountain.domain.notice.dto.DeptNoticeResponse;
import com.mountain.for_mountain.domain.notice.model.entity.DeptNotice;
import com.mountain.for_mountain.domain.notice.repository.DeptNoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeptNoticeService {

    /** 모든 부서에 공개되는 특수 값. */
    private static final String ALL_DEPARTMENTS = "全部署";

    private final DeptNoticeRepository deptNoticeRepository;
    private final EmployeeRepository employeeRepository;

    /**
     * 부서 공지 조회.
     * ADMIN 이 아니면 본인 소속 부서와 전체 공지({@value #ALL_DEPARTMENTS})만 볼 수 있다.
     * (예전에는 모든 부서의 공지가 누구에게나 노출됐다.)
     */
    public List<DeptNoticeResponse> getList(String department, Authentication authentication) {
        List<DeptNotice> notices;
        if (department != null && !department.isBlank()) {
            notices = deptNoticeRepository.findByDepartmentOrderByCreatedAtDesc(department);
        } else {
            notices = deptNoticeRepository.findAllByOrderByCreatedAtDesc();
        }

        if (!isAdmin(authentication)) {
            String callerDepartment = resolveCaller(authentication)
                    .map(Employee::getDepartment)
                    .orElse(null);
            notices = notices.stream()
                    .filter(notice -> ALL_DEPARTMENTS.equals(notice.getDepartment())
                            || (callerDepartment != null && callerDepartment.equals(notice.getDepartment())))
                    .toList();
        }

        return notices.stream()
                .map(DeptNoticeResponse::new)
                .toList();
    }

    @Transactional
    public DeptNoticeResponse create(DeptNoticeRequest request, Authentication authentication) {
        DeptNotice notice = DeptNotice.create(
                request.getDepartment(),
                request.getTitle(),
                request.getContent(),
                resolveAuthor(authentication, request)
        );
        return new DeptNoticeResponse(deptNoticeRepository.save(notice));
    }

    @Transactional
    public DeptNoticeResponse update(Long id, DeptNoticeRequest request, Authentication authentication) {
        DeptNotice notice = deptNoticeRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.DEPT_NOTICE_NOT_FOUND));
        notice.update(
                request.getDepartment(),
                request.getTitle(),
                request.getContent(),
                resolveAuthor(authentication, request)
        );
        return new DeptNoticeResponse(notice);
    }

    /**
     * 작성자는 토큰 주체의 사원명으로 고정한다.
     * 사원 정보를 찾지 못한 경우에만 요청값을 쓴다(초기 데이터 이관 등).
     */
    private String resolveAuthor(Authentication authentication, DeptNoticeRequest request) {
        return resolveCaller(authentication)
                .map(Employee::getName)
                .filter(name -> name != null && !name.isBlank())
                .orElseGet(request::getAuthor);
    }

    private java.util.Optional<Employee> resolveCaller(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return java.util.Optional.empty();
        }
        return employeeRepository.findByEmployeeNumber(authentication.getName().trim());
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null
                && authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .anyMatch("ROLE_ADMIN"::equals);
    }

    @Transactional
    public void delete(Long id) {
        DeptNotice notice = deptNoticeRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.DEPT_NOTICE_NOT_FOUND));
        deptNoticeRepository.delete(notice);
    }
}
