package com.mountain.for_mountain.domain.leave.service;

import com.mountain.for_mountain.domain.employee.model.entity.Employee;
import com.mountain.for_mountain.domain.employee.repository.EmployeeRepository;
import com.mountain.for_mountain.domain.group.repository.GroupMemberRepository;
import com.mountain.for_mountain.domain.group.repository.GroupRepository;
import com.mountain.for_mountain.domain.leave.repository.LeaveRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class LeaveServiceTest {

    @Mock LeaveRepository leaveRepository;
    @Mock EmployeeRepository employeeRepository;
    @Mock GroupRepository groupRepository;
    @Mock GroupMemberRepository groupMemberRepository;
    @Mock LeaveMailSender leaveMailSender;
    @Mock LeaveHoliday leaveHoliday;

    private LeaveService leaveService;

    @BeforeEach
    void setUp() {
        leaveService = new LeaveService(
                leaveRepository,
                employeeRepository,
                groupRepository,
                groupMemberRepository,
                leaveMailSender,
                leaveHoliday
        );
    }

    @Test
    void compensatoryLeaveDoesNotRequireAnnualLeaveBalance() {
        boolean requiresBalance = ReflectionTestUtils.invokeMethod(leaveService, "requiresLeaveBalance", "代休");

        assertThat(requiresBalance).isFalse();
    }

    @Test
    void upperApproverIsPresidentAtEndOfThreeLevelChain() {
        Employee manager = employee(2L, "manager");
        Employee departmentHead = employee(3L, "department-head");
        Employee president = employee(4L, "president");

        Optional<Employee> upperApprover = ReflectionTestUtils.invokeMethod(
                leaveService,
                "resolveUpperApprover",
                List.of(manager, departmentHead, president)
        );

        assertThat(upperApprover).contains(president);
    }

    private Employee employee(Long id, String employeeNumber) {
        Employee employee = Employee.create(
                employeeNumber,
                employeeNumber,
                employeeNumber,
                "日本",
                LocalDate.of(1990, 1, 1),
                "department",
                "社員",
                "一般社員",
                LocalDate.of(2020, 1, 1),
                employeeNumber + "@example.com",
                "在籍",
                0
        );
        ReflectionTestUtils.setField(employee, "id", id);
        return employee;
    }
}
