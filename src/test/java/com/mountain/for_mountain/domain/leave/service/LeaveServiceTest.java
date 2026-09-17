package com.mountain.for_mountain.domain.leave.service;

import com.mountain.for_mountain.domain.employee.model.entity.Employee;
import com.mountain.for_mountain.domain.employee.repository.EmployeeRepository;
import com.mountain.for_mountain.domain.group.repository.GroupMemberRepository;
import com.mountain.for_mountain.domain.group.repository.GroupRepository;
import com.mountain.for_mountain.domain.group.model.entity.Group;
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
import static org.mockito.Mockito.when;

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

    @Test
    void presidentIsAppendedWhenGroupHierarchyHasNoUpperApprover() {
        Employee applicant = employee(1L, "applicant", "社員");
        Employee manager = employee(2L, "manager", "課長");
        Employee president = employee(4L, "president", "代表取締役");
        Group department = Group.create("department", "", manager.getId(), null, null, false);
        ReflectionTestUtils.setField(department, "id", 10L);

        when(groupRepository.findByName("department")).thenReturn(Optional.of(department));
        when(employeeRepository.findById(manager.getId())).thenReturn(Optional.of(manager));
        when(employeeRepository.findFirstByPositionAndStatusOrderByIdAsc("代表取締役", "在籍"))
                .thenReturn(Optional.of(president));

        List<Employee> chain = ReflectionTestUtils.invokeMethod(leaveService, "resolveApprovalChain", applicant);

        assertThat(chain).containsExactly(manager, president);
    }

    private Employee employee(Long id, String employeeNumber) {
        return employee(id, employeeNumber, "社員");
    }

    private Employee employee(Long id, String employeeNumber, String position) {
        Employee employee = Employee.create(
                employeeNumber,
                employeeNumber,
                employeeNumber,
                "日本",
                LocalDate.of(1990, 1, 1),
                "department",
                position,
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
