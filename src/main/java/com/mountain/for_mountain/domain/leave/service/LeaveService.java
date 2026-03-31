package com.mountain.for_mountain.domain.leave.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.employee.model.entity.Employee;
import com.mountain.for_mountain.domain.employee.repository.EmployeeRepository;
import com.mountain.for_mountain.domain.group.model.entity.Group;
import com.mountain.for_mountain.domain.group.repository.GroupMemberRepository;
import com.mountain.for_mountain.domain.group.repository.GroupRepository;
import com.mountain.for_mountain.domain.leave.dto.LeaveCreateRequest;
import com.mountain.for_mountain.domain.leave.dto.LeaveResponse;
import com.mountain.for_mountain.domain.leave.dto.LeaveUpdateRequest;
import com.mountain.for_mountain.domain.leave.model.entity.Leave;
import com.mountain.for_mountain.domain.leave.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaveService {

    private static final List<String> CANCELLABLE_STATUSES = List.of("待機中", "拒否", "却下", "否認");

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final JavaMailSender mailSender;

    @Value("${app.frontend-base-url:}")
    private String frontendBaseUrl;

    public List<LeaveResponse> getList(String status, String department, Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return List.of();
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        Employee caller = employeeRepository.findByEmployeeNumber(authentication.getName())
                .orElseThrow(() -> new CustomException(ErrorCode.ACCOUNT_NOT_FOUND));

        List<Group> allGroups = groupRepository.findAllByOrderByCreatedAtAsc();
        Set<Long> leaderMemberIds = resolveLeaderMemberIds(allGroups, caller.getId());

        return leaveRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(leave -> {
                    if (isAdmin) return true;
                    if (leaderMemberIds != null) return leaderMemberIds.contains(leave.getEmployeeId());
                    return leave.getEmployeeId().equals(caller.getId());
                })
                .map(this::toResponse)
                .filter(leave -> status == null || status.isBlank() || leave.getStatus().equals(status))
                .filter(leave -> department == null || department.isBlank() || leave.getDepartment().equals(department))
                .toList();
    }

    @Transactional
    public LeaveResponse create(LeaveCreateRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new CustomException(ErrorCode.ACCOUNT_NOT_FOUND));
        validateLeaveDaysWithinBalance(employee, request.getDays());
        Leave leave = Leave.create(
                employee.getId(),
                request.getLeaveType(),
                LocalDate.parse(request.getStartDate()),
                LocalDate.parse(request.getEndDate()),
                request.getDays(),
                request.getReason()
        );
        Leave saved = leaveRepository.save(leave);
        sendLeaveRequestMail(employee, saved);
        return toResponse(saved);
    }

    @Transactional
    public LeaveResponse updateOwnPendingLeave(Long id, LeaveUpdateRequest request, String employeeNumber) {
        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.LEAVE_NOT_FOUND));
        Employee currentEmployee = employeeRepository.findByEmployeeNumber(employeeNumber == null ? "" : employeeNumber.trim())
                .orElseThrow(() -> new CustomException(ErrorCode.ACCOUNT_NOT_FOUND));
        Employee leaveEmployee = employeeRepository.findById(leave.getEmployeeId())
                .orElseThrow(() -> new CustomException(ErrorCode.ACCOUNT_NOT_FOUND));

        if (!leaveEmployee.getId().equals(currentEmployee.getId()) || !"待機中".equals(leave.getStatus())) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }

        validateLeaveDaysWithinBalance(currentEmployee, request.getDays());
        leave.updateDetails(
                request.getLeaveType(),
                LocalDate.parse(request.getStartDate()),
                LocalDate.parse(request.getEndDate()),
                request.getDays(),
                request.getReason()
        );
        return toResponse(leave);
    }

    @Transactional
    public LeaveResponse updateStatus(Long id, String status, Authentication authentication) {
        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.LEAVE_NOT_FOUND));

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            Employee caller = employeeRepository.findByEmployeeNumber(authentication.getName())
                    .orElseThrow(() -> new CustomException(ErrorCode.ACCOUNT_NOT_FOUND));
            List<Group> allGroups = groupRepository.findAllByOrderByCreatedAtAsc();
            Set<Long> memberIds = resolveLeaderMemberIds(allGroups, caller.getId());
            if (memberIds == null || !memberIds.contains(leave.getEmployeeId())) {
                throw new CustomException(ErrorCode.ACCESS_DENIED);
            }
        }

        leave.updateStatus(status);
        return toResponse(leave);
    }

    private Set<Long> resolveLeaderMemberIds(List<Group> allGroups, Long employeeId) {
        List<Group> myGroups = allGroups.stream()
                .filter(g -> employeeId.equals(g.getLeaderId()))
                .toList();
        if (myGroups.isEmpty()) return null;

        Set<Long> memberIds = new HashSet<>();
        Queue<Group> queue = new LinkedList<>(myGroups);
        Set<Long> visited = new HashSet<>();

        while (!queue.isEmpty()) {
            Group group = queue.poll();
            if (visited.contains(group.getId())) continue;
            visited.add(group.getId());
            groupMemberRepository.findByGroupId(group.getId())
                    .forEach(gm -> memberIds.add(gm.getEmployeeId()));
            allGroups.stream()
                    .filter(g -> group.getId().equals(g.getParentGroupId()))
                    .forEach(queue::add);
        }
        return memberIds;
    }

    @Transactional
    public void cancelOwnPendingLeave(Long id, String employeeNumber) {
        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.LEAVE_NOT_FOUND));
        Employee currentEmployee = employeeRepository.findByEmployeeNumber(employeeNumber == null ? "" : employeeNumber.trim())
                .orElseThrow(() -> new CustomException(ErrorCode.ACCOUNT_NOT_FOUND));
        Employee leaveEmployee = employeeRepository.findById(leave.getEmployeeId())
                .orElseThrow(() -> new CustomException(ErrorCode.ACCOUNT_NOT_FOUND));

        if (!leaveEmployee.getId().equals(currentEmployee.getId()) || !CANCELLABLE_STATUSES.contains(leave.getStatus())) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }

        leaveRepository.delete(leave);
    }

    private LeaveResponse toResponse(Leave leave) {
        Employee employee = employeeRepository.findById(leave.getEmployeeId())
                .orElseThrow(() -> new CustomException(ErrorCode.ACCOUNT_NOT_FOUND));
        return new LeaveResponse(
                leave.getId(),
                employee.getId(),
                employee.getName(),
                employee.getDepartment(),
                leave.getLeaveType(),
                leave.getStartDate().toString(),
                leave.getEndDate().toString(),
                leave.getDays(),
                leave.getReason(),
                leave.getStatus(),
                leave.getAppliedAt().toString()
        );
    }

    private void sendLeaveRequestMail(Employee employee, Leave leave) {
        groupRepository.findByName(employee.getDepartment())
                .flatMap(group -> resolveApprovalLeader(group, employee.getId()))
                .filter(leader -> leader.getEmail() != null && !leader.getEmail().isBlank())
                .ifPresent(leader -> {
                    try {
                        SimpleMailMessage message = new SimpleMailMessage();
                        message.setTo(leader.getEmail());
                        message.setSubject("【休暇申請】" + employee.getName() + " さん");
                        message.setText(buildLeaveRequestMailBody(employee, leave, leader));
                        mailSender.send(message);
                    } catch (Exception e) {
                        log.error("Failed to send leave request mail for employee {}", employee.getEmployeeNumber(), e);
                    }
                });
    }

    private java.util.Optional<Employee> resolveApprovalLeader(Group group, Long applicantId) {
        Group current = group;
        Set<Long> visited = new HashSet<>();

        while (current != null && visited.add(current.getId())) {
            if (current.getLeaderId() != null && !current.getLeaderId().equals(applicantId)) {
                return employeeRepository.findById(current.getLeaderId());
            }

            if (current.getParentGroupId() == null) {
                break;
            }

            current = groupRepository.findById(current.getParentGroupId()).orElse(null);
        }

        return java.util.Optional.empty();
    }

    private String buildLeaveRequestMailBody(Employee employee, Leave leave, Employee leader) {
        String approvalUrl = buildApprovalUrl(leave.getId());
        List<String> lines = new ArrayList<>(List.of(
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                "休暇申請通知",
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                "承認者      : " + leader.getName(),
                "申請者      : " + employee.getName(),
                "所属部署    : " + employee.getDepartment(),
                "休暇種類    : " + leave.getLeaveType(),
                "期間        : " + leave.getStartDate() + " ~ " + leave.getEndDate(),
                "日数        : " + leave.getDays() + "日",
                "申請理由    : " + (leave.getReason() == null || leave.getReason().isBlank() ? "-" : leave.getReason()),
                ""
        ));
        if (approvalUrl != null) {
            lines.add("確認URL    : " + approvalUrl);
            lines.add("");
        }
        lines.add("社内システムで内容をご確認ください。");
        return String.join("\n", lines);
    }

    private String buildApprovalUrl(Long leaveId) {
        if (frontendBaseUrl == null || frontendBaseUrl.isBlank()) {
            return null;
        }
        String normalizedBaseUrl = frontendBaseUrl.endsWith("/")
                ? frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1)
                : frontendBaseUrl;
        return normalizedBaseUrl + "/admin/leave/" + leaveId;
    }

    private void validateLeaveDaysWithinBalance(Employee employee, Integer requestedDays) {
        int remainingDays = employee.getAnnualLeaveDays() == null ? 0 : employee.getAnnualLeaveDays();
        int days = requestedDays == null ? 0 : requestedDays;
        if (days > remainingDays) {
            throw new CustomException(ErrorCode.INSUFFICIENT_LEAVE_BALANCE);
        }
    }
}
