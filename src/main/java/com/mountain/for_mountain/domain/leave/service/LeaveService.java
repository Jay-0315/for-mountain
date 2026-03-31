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
import java.util.Comparator;
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
    private static final int[] GRANT_SCHEDULE = {10, 11, 12, 14, 16, 18, 20};

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
        validateLeaveDaysWithinBalance(employee, request.getLeaveType(), request.getDays());
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

        validateLeaveDaysWithinBalance(currentEmployee, request.getLeaveType(), request.getDays());
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

    private void validateLeaveDaysWithinBalance(Employee employee, String leaveType, Integer requestedDays) {
        int days = requestedDays == null ? 0 : requestedDays;
        if (days <= 0) {
            return;
        }

        if (!requiresLeaveBalance(leaveType)) {
            return;
        }

        int remainingDays = calculateRemainingLeaveDays(employee);
        if (days > remainingDays) {
            throw new CustomException(ErrorCode.INSUFFICIENT_LEAVE_BALANCE);
        }
    }

    private int calculateRemainingLeaveDays(Employee employee) {
        if (employee.getJoinDate() == null) {
            return employee.getAnnualLeaveDays() == null ? 0 : employee.getAnnualLeaveDays();
        }

        LocalDate today = LocalDate.now();
        LocalDate firstGrant = employee.getJoinDate().plusMonths(6);
        List<LeavePool> pools = new ArrayList<>();

        if (today.isBefore(firstGrant)) {
            pools.add(new LeavePool(employee.getJoinDate(), firstGrant.plusYears(2), 5));
        } else {
            int grantIndex = 0;
            LocalDate grantDate = firstGrant;

            while (!grantDate.isAfter(today)) {
                LocalDate expiryDate = grantDate.plusYears(2);
                if (expiryDate.isAfter(today)) {
                    pools.add(new LeavePool(grantDate, expiryDate, getGrantDays(grantIndex)));
                }
                grantIndex += 1;
                grantDate = firstGrant.plusYears(grantIndex);
            }
        }

        List<Leave> approvedLeaves = leaveRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(leave -> leave.getEmployeeId().equals(employee.getId()))
                .filter(leave -> "承認".equals(leave.getStatus()))
                .filter(this::requiresLeaveBalance)
                .sorted(Comparator.comparing(Leave::getStartDate))
                .toList();

        for (Leave leave : approvedLeaves) {
            int daysLeft = leave.getDays() == null ? 0 : leave.getDays();
            for (LeavePool pool : pools) {
                if (daysLeft <= 0) {
                    break;
                }
                if ((leave.getStartDate().isEqual(pool.grantDate) || leave.getStartDate().isAfter(pool.grantDate))
                        && leave.getStartDate().isBefore(pool.expiryDate)
                        && pool.remainingDays > 0) {
                    int deduct = Math.min(daysLeft, pool.remainingDays);
                    pool.remainingDays -= deduct;
                    daysLeft -= deduct;
                }
            }
        }

        return pools.stream()
                .mapToInt(pool -> pool.remainingDays)
                .sum();
    }

    private boolean requiresLeaveBalance(Leave leave) {
        return leave != null && requiresLeaveBalance(leave.getLeaveType());
    }

    private boolean requiresLeaveBalance(String leaveType) {
        if (leaveType == null || leaveType.isBlank()) {
            return false;
        }

        return leaveType.contains("有給")
                || leaveType.contains("公休")
                || leaveType.contains("代休");
    }

    private int getGrantDays(int index) {
        return GRANT_SCHEDULE[Math.min(index, GRANT_SCHEDULE.length - 1)];
    }

    private static final class LeavePool {
        private final LocalDate grantDate;
        private final LocalDate expiryDate;
        private int remainingDays;

        private LeavePool(LocalDate grantDate, LocalDate expiryDate, int remainingDays) {
            this.grantDate = grantDate;
            this.expiryDate = expiryDate;
            this.remainingDays = remainingDays;
        }
    }
}
