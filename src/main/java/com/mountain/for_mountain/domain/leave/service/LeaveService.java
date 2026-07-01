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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

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

    private static final String STATUS_PENDING = "待機中";
    private static final String STATUS_UPPER_PENDING = "上位承認待ち";
    private static final String STATUS_APPROVED = "承認";
    private static final String STATUS_REJECTED = "拒否";
    private static final List<String> CANCELLABLE_STATUSES = List.of(STATUS_PENDING, STATUS_REJECTED, "却下", "否認");
    private static final Set<String> BALANCE_DEDUCTING_LEAVE_TYPES = Set.of("有給", "午前給(有給)", "午後給(有給)", "代休");
    private static final int[] GRANT_SCHEDULE = {10, 11, 12, 14, 16, 18, 20};

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final LeaveMailSender leaveMailSender;

    @Value("${app.frontend-base-url:}")
    private String frontendBaseUrl;

    public List<LeaveResponse> getList(String status, String department, Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return List.of();
        }

        Employee caller = employeeRepository.findByEmployeeNumber(authentication.getName())
                .orElseThrow(() -> new CustomException(ErrorCode.ACCOUNT_NOT_FOUND));

        // 휴가는 신청자 본인과 지정 승인자(1차/상위)만 열람 가능. ADMIN 역할이어도 전체 열람 불가.
        return leaveRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(leave -> leave.getEmployeeId().equals(caller.getId()) || isLeaveApprover(leave, caller))
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
        // 승인자가 없는 신청(대표 등 최상위)은 자동 승인한다.
        if (resolveApprovalChain(employee).isEmpty()) {
            saved.updateStatus(STATUS_APPROVED);
        } else {
            sendLeaveRequestMail(employee, saved);
        }
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

        if (!leaveEmployee.getId().equals(currentEmployee.getId()) || !STATUS_PENDING.equals(leave.getStatus())) {
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

        // 승인/거부/되돌리기는 각 단계의 "지정 승인자"만 가능 (ADMIN 역할이어도 우회 불가).
        Employee caller = employeeRepository.findByEmployeeNumber(authentication.getName()).orElse(null);

        Employee applicant = employeeRepository.findById(leave.getEmployeeId())
                .orElseThrow(() -> new CustomException(ErrorCode.ACCOUNT_NOT_FOUND));
        List<Employee> approvalChain = resolveApprovalChain(applicant);
        java.util.Optional<Employee> firstApprover = resolveFirstApprover(approvalChain);
        java.util.Optional<Employee> upperApprover = resolveUpperApprover(applicant, approvalChain);

        if (STATUS_APPROVED.equals(status)) {
            if (STATUS_PENDING.equals(leave.getStatus())) {
                if (!isSameEmployee(firstApprover, caller)) {
                    throw new CustomException(ErrorCode.ACCESS_DENIED);
                }
                if (upperApprover.isPresent()) {
                    leave.updateStatus(STATUS_UPPER_PENDING);
                    sendLeaveRequestMail(applicant, leave, upperApprover.get());
                } else {
                    leave.updateStatus(STATUS_APPROVED);
                }
                return toResponse(leave);
            }

            if (STATUS_UPPER_PENDING.equals(leave.getStatus())) {
                if (!isSameEmployee(upperApprover, caller)) {
                    throw new CustomException(ErrorCode.ACCESS_DENIED);
                }
                leave.updateStatus(STATUS_APPROVED);
                return toResponse(leave);
            }

            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }

        if (STATUS_REJECTED.equals(status)) {
            if (!canActOnCurrentApprovalStage(leave, caller, firstApprover, upperApprover)) {
                throw new CustomException(ErrorCode.ACCESS_DENIED);
            }
            leave.updateStatus(STATUS_REJECTED);
            return toResponse(leave);
        }

        if (STATUS_PENDING.equals(status)) {
            if (!canActOnCurrentApprovalStage(leave, caller, firstApprover, upperApprover)) {
                throw new CustomException(ErrorCode.ACCESS_DENIED);
            }
            leave.updateStatus(STATUS_PENDING);
            return toResponse(leave);
        }

        throw new CustomException(ErrorCode.ACCESS_DENIED);
    }

    private boolean isSameEmployee(java.util.Optional<Employee> approver, Employee caller) {
        return caller != null && approver.map(employee -> employee.getId().equals(caller.getId())).orElse(false);
    }

    private boolean canActOnCurrentApprovalStage(
            Leave leave,
            Employee caller,
            java.util.Optional<Employee> firstApprover,
            java.util.Optional<Employee> upperApprover
    ) {
        if (leave == null || caller == null) {
            return false;
        }
        if (STATUS_PENDING.equals(leave.getStatus())) {
            return isSameEmployee(firstApprover, caller);
        }
        if (STATUS_UPPER_PENDING.equals(leave.getStatus())) {
            return isSameEmployee(upperApprover, caller);
        }
        return isSameEmployee(firstApprover, caller) || isSameEmployee(upperApprover, caller);
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

    private boolean isLeaveApprover(Leave leave, Employee caller) {
        if (leave == null || caller == null) {
            return false;
        }
        Employee applicant = employeeRepository.findById(leave.getEmployeeId())
                .orElseThrow(() -> new CustomException(ErrorCode.ACCOUNT_NOT_FOUND));
        List<Employee> chain = resolveApprovalChain(applicant);
        return isSameEmployee(resolveFirstApprover(chain), caller)
                || isSameEmployee(resolveUpperApprover(applicant, chain), caller);
    }

    /** 1차 승인자 = 신청자 직속 상급 그룹 리더 (체인의 첫 번째). */
    private java.util.Optional<Employee> resolveFirstApprover(List<Employee> chain) {
        return chain.isEmpty() ? java.util.Optional.empty() : java.util.Optional.of(chain.get(0));
    }

    /**
     * 상위 승인자.
     * - 신청자가 그룹 리더(파트장/그룹장 등)이면 → 체인 최상위 = 대표
     * - 일반 직원이면 → 체인의 두 번째(직속 상급의 상급 = 그룹장)
     */
    private java.util.Optional<Employee> resolveUpperApprover(Employee applicant, List<Employee> chain) {
        if (chain.size() < 2) {
            return java.util.Optional.empty();
        }
        int index = isGroupLeader(applicant) ? chain.size() - 1 : 1;
        return java.util.Optional.of(chain.get(index));
    }

    /** 신청자가 어떤 그룹이든 리더로 지정되어 있는지 여부. */
    private boolean isGroupLeader(Employee employee) {
        return employee != null && !groupRepository.findByLeaderId(employee.getId()).isEmpty();
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
        resolveApprovalChain(employee).stream()
                .findFirst()
                .filter(leader -> leader.getEmail() != null && !leader.getEmail().isBlank())
                .ifPresent(leader -> sendLeaveRequestMail(employee, leave, leader));
    }

    /**
     * 신청자의 부서 그룹부터 상위 그룹으로 올라가며 승인자(각 그룹 리더)를 순서대로 모은다.
     * 신청자 본인이 리더인 그룹은 건너뛰어 본인 승인을 방지한다.
     * 예) 파트장 신청 → [그룹장, 사장], 그룹장 신청 → [사장]
     */
    private List<Employee> resolveApprovalChain(Employee applicant) {
        List<Employee> chain = new ArrayList<>();
        if (applicant == null) {
            return chain;
        }
        Group group = groupRepository.findByName(applicant.getDepartment()).orElse(null);
        Set<Long> visitedGroups = new HashSet<>();
        while (group != null && !visitedGroups.contains(group.getId())) {
            visitedGroups.add(group.getId());
            // 승인 라인에서 제외된 그룹(예: 本部)은 리더를 승인자로 넣지 않고 상위로 통과시킨다.
            java.util.Optional<Employee> leaderOpt = Boolean.TRUE.equals(group.getExcludeFromApproval())
                    ? java.util.Optional.empty()
                    : resolveDirectGroupLeader(group);
            if (leaderOpt.isPresent()) {
                Employee leader = leaderOpt.get();
                boolean isSelf = leader.getId().equals(applicant.getId());
                boolean alreadyAdded = chain.stream().anyMatch(e -> e.getId().equals(leader.getId()));
                if (!isSelf && !alreadyAdded) {
                    chain.add(leader);
                }
            }
            group = group.getParentGroupId() == null
                    ? null
                    : groupRepository.findById(group.getParentGroupId()).orElse(null);
        }
        return chain;
    }

    private void sendLeaveRequestMail(Employee employee, Leave leave, Employee leader) {
        if (leader == null || leader.getEmail() == null || leader.getEmail().isBlank()) {
            return;
        }
        // 메일 내용은 트랜잭션 안에서 미리 구성하고, 실제 발송은 커밋 후 비동기로 1회만 수행한다.
        // (커밋 전 발송 + 요청 재시도로 인한 중복 발송 방지)
        String to = leader.getEmail();
        String subject = "【休暇申請】" + employee.getName() + " さん";
        String body = buildLeaveRequestMailBody(employee, leave, leader);
        runAfterCommit(() -> leaveMailSender.send(to, subject, body));
    }

    /** 트랜잭션이 있으면 커밋 후에, 없으면 즉시 실행한다. */
    private void runAfterCommit(Runnable action) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    action.run();
                }
            });
        } else {
            action.run();
        }
    }

    private java.util.Optional<Employee> resolveDirectGroupLeader(Group group) {
        if (group == null || group.getLeaderId() == null) {
            return java.util.Optional.empty();
        }
        return employeeRepository.findById(group.getLeaderId());
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
                "日数        : " + formatLeaveDays(leave.getDays()) + "日",
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
        return normalizedBaseUrl + "/admin/leave/detail?id=" + leaveId;
    }

    private void validateLeaveDaysWithinBalance(Employee employee, String leaveType, Double requestedDays) {
        double days = requestedDays == null ? 0 : requestedDays;
        if (days <= 0) {
            return;
        }

        if (!requiresLeaveBalance(leaveType)) {
            return;
        }

        double remainingDays = calculateRemainingLeaveDays(employee);
        if (days > remainingDays) {
            throw new CustomException(ErrorCode.INSUFFICIENT_LEAVE_BALANCE);
        }
    }

    private double calculateRemainingLeaveDays(Employee employee) {
        if (employee.getJoinDate() == null) {
            return employee.getAnnualLeaveDays() == null ? 0 : employee.getAnnualLeaveDays();
        }

        LocalDate today = LocalDate.now();
        LocalDate joinDate = employee.getJoinDate();
        List<LeavePool> pools = new ArrayList<>();

        // 입사일 5일 + 입사 6개월 5일(초기 10일), 이후 매 입사 기념일마다 11/12/14/16/18/20일 누적(시효 2년).
        addLeavePoolIfActive(pools, joinDate, 5, today);
        addLeavePoolIfActive(pools, joinDate.plusMonths(6), 5, today);
        for (int year = 1; ; year++) {
            LocalDate grantDate = joinDate.plusYears(year);
            if (grantDate.isAfter(today)) {
                break;
            }
            addLeavePoolIfActive(pools, grantDate, getGrantDays(year), today);
        }

        List<Leave> approvedLeaves = leaveRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(leave -> leave.getEmployeeId().equals(employee.getId()))
                .filter(leave -> STATUS_APPROVED.equals(leave.getStatus()))
                .filter(this::requiresLeaveBalance)
                .sorted(Comparator.comparing(Leave::getStartDate))
                .toList();

        for (Leave leave : approvedLeaves) {
            double daysLeft = leave.getDays() == null ? 0 : leave.getDays();
            for (LeavePool pool : pools) {
                if (daysLeft <= 0) {
                    break;
                }
                if ((leave.getStartDate().isEqual(pool.grantDate) || leave.getStartDate().isAfter(pool.grantDate))
                        && leave.getStartDate().isBefore(pool.expiryDate)
                        && pool.remainingDays > 0) {
                    double deduct = Math.min(daysLeft, pool.remainingDays);
                    pool.remainingDays -= deduct;
                    daysLeft -= deduct;
                }
            }
        }

        return pools.stream()
                .mapToDouble(pool -> pool.remainingDays)
                .sum();
    }

    private boolean requiresLeaveBalance(Leave leave) {
        return leave != null && requiresLeaveBalance(leave.getLeaveType());
    }

    private boolean requiresLeaveBalance(String leaveType) {
        if (leaveType == null || leaveType.isBlank()) {
            return false;
        }

        return BALANCE_DEDUCTING_LEAVE_TYPES.contains(leaveType.trim());
    }

    private String formatLeaveDays(Double days) {
        if (days == null) {
            return "0";
        }
        if (days.doubleValue() == Math.rint(days.doubleValue())) {
            return String.valueOf(days.intValue());
        }
        return String.valueOf(days);
    }

    private int getGrantDays(int index) {
        return GRANT_SCHEDULE[Math.min(index, GRANT_SCHEDULE.length - 1)];
    }

    /** 부여일이 지났고(부여됨) 아직 만료(부여일+2년)되지 않은 풀만 추가한다. */
    private void addLeavePoolIfActive(List<LeavePool> pools, LocalDate grantDate, int days, LocalDate today) {
        if (grantDate.isAfter(today)) {
            return; // 아직 부여 전
        }
        LocalDate expiryDate = grantDate.plusYears(2);
        if (!expiryDate.isAfter(today)) {
            return; // 이미 만료
        }
        pools.add(new LeavePool(grantDate, expiryDate, days));
    }

    private static final class LeavePool {
        private final LocalDate grantDate;
        private final LocalDate expiryDate;
        private double remainingDays;

        private LeavePool(LocalDate grantDate, LocalDate expiryDate, double remainingDays) {
            this.grantDate = grantDate;
            this.expiryDate = expiryDate;
            this.remainingDays = remainingDays;
        }
    }
}
