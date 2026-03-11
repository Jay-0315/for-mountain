package com.mountain.for_mountain.domain.employee.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.auth.repository.AdminAccountRepository;
import com.mountain.for_mountain.domain.auth.service.AccountManagementService;
import com.mountain.for_mountain.domain.employee.dto.EmployeeRequest;
import com.mountain.for_mountain.domain.employee.dto.EmployeeResponse;
import com.mountain.for_mountain.domain.employee.model.entity.Employee;
import com.mountain.for_mountain.domain.employee.repository.EmployeeRepository;
import com.mountain.for_mountain.domain.group.repository.GroupMemberRepository;
import com.mountain.for_mountain.domain.group.repository.GroupRepository;
import com.mountain.for_mountain.domain.leave.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final AdminAccountRepository adminAccountRepository;
    private final AccountManagementService accountManagementService;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final LeaveRepository leaveRepository;

    public List<EmployeeResponse> getList(String status, String department, String keyword) {
        return employeeRepository.findAllByOrderByJoinDateDesc().stream()
                .filter(employee -> status == null || status.isBlank() || employee.getStatus().equals(status))
                .filter(employee -> department == null || department.isBlank() || employee.getDepartment().equals(department))
                .filter(employee -> keyword == null || keyword.isBlank()
                        || employee.getName().contains(keyword)
                        || employee.getNameKana().contains(keyword)
                        || employee.getEmployeeNumber().contains(keyword))
                .map(EmployeeResponse::new)
                .toList();
    }

    @Transactional
    public EmployeeResponse create(EmployeeRequest request) {
        Employee employee = Employee.create(
                request.getEmployeeNumber(),
                request.getName(),
                request.getNameKana(),
                request.getNationality(),
                LocalDate.parse(request.getBirthDate()),
                request.getDepartment(),
                request.getPosition(),
                request.getJobTitle(),
                LocalDate.parse(request.getJoinDate()),
                request.getEmail(),
                request.getStatus()
        );
        Employee saved = employeeRepository.save(employee);
        syncAccountRole(saved.getEmployeeNumber(), saved.getPosition());
        return new EmployeeResponse(saved);
    }

    @Transactional
    public EmployeeResponse update(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.ACCOUNT_NOT_FOUND));
        employee.update(
                request.getEmployeeNumber(),
                request.getName(),
                request.getNameKana(),
                request.getNationality(),
                LocalDate.parse(request.getBirthDate()),
                request.getDepartment(),
                request.getPosition(),
                request.getJobTitle(),
                LocalDate.parse(request.getJoinDate()),
                request.getEmail(),
                request.getStatus()
        );
        syncAccountRole(employee.getEmployeeNumber(), employee.getPosition());
        return new EmployeeResponse(employee);
    }

    @Transactional
    public void delete(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.ACCOUNT_NOT_FOUND));

        groupMemberRepository.deleteByEmployeeId(id);
        leaveRepository.deleteByEmployeeId(id);
        groupRepository.findByLeaderId(id).forEach(group -> group.clearLeader());
        adminAccountRepository.deleteByUsername(employee.getEmployeeNumber());
        employeeRepository.delete(employee);
    }

    private void syncAccountRole(String employeeNumber, String position) {
        adminAccountRepository.findByUsername(employeeNumber)
                .ifPresent(account -> account.syncIdentity(
                        employeeNumber,
                        accountManagementService.resolveRole(position)
                ));
    }
}
