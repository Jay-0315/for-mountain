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
    void presidentIsNotAppendedWhenGroupHasAnApprover() {
        Employee applicant = employee(1L, "applicant", "社員");
        Employee manager = employee(2L, "manager", "課長");
        Group department = Group.create("department", "", manager.getId(), null, null, false);
        ReflectionTestUtils.setField(department, "id", 10L);

        when(groupRepository.findByName("department")).thenReturn(Optional.of(department));
        when(employeeRepository.findById(manager.getId())).thenReturn(Optional.of(manager));

        List<Employee> chain = ReflectionTestUtils.invokeMethod(leaveService, "resolveApprovalChain", applicant);

        assertThat(chain).containsExactly(manager);
    }

    @Test
    void approvalChainMatchesNormalizedDepartment() {
        Employee applicant = employee(1L, "applicant", "主任");
        ReflectionTestUtils.setField(applicant, "department", "開発パート２");
        Employee manager = employee(2L, "manager", "課長");
        Group department = Group.create("開発Part2", "", manager.getId(), null, null, false);
        ReflectionTestUtils.setField(department, "id", 10L);

        when(groupRepository.findByName("開発パート２")).thenReturn(Optional.empty());
        when(groupRepository.findAllByOrderByCreatedAtAsc()).thenReturn(List.of(department));
        when(employeeRepository.findById(manager.getId())).thenReturn(Optional.of(manager));

        List<Employee> chain = ReflectionTestUtils.invokeMethod(leaveService, "resolveApprovalChain", applicant);

        assertThat(chain).containsExactly(manager);
    }

    @Test
    void parentLeaderApprovesWhenDepartmentHasNoLeader() {
        Employee applicant = employee(1L, "applicant");
        Employee manager = employee(2L, "manager");
        Group department = Group.create("department", "", null, 20L, null, false);
        Group parent = Group.create("parent", "", manager.getId(), null, null, false);
        ReflectionTestUtils.setField(department, "id", 10L);
        ReflectionTestUtils.setField(parent, "id", 20L);
        when(groupRepository.findByName("department")).thenReturn(Optional.of(department));
        when(groupRepository.findById(20L)).thenReturn(Optional.of(parent));
        when(employeeRepository.findById(manager.getId())).thenReturn(Optional.of(manager));

        List<Employee> chain = ReflectionTestUtils.invokeMethod(leaveService, "resolveApprovalChain", applicant);

        assertThat(chain).containsExactly(manager);
    }

    @Test
    void presidentIsFallbackWhenOnlySelfAndExcludedLeadersExist() {
        Employee applicant = employee(1L, "applicant");
        Employee president = employee(4L, "president", "代表 取締役");
        Group department = Group.create("department", "", applicant.getId(), 20L, null, false);
        Group parent = Group.create("parent", "", 2L, null, null, true);
        ReflectionTestUtils.setField(department, "id", 10L);
        ReflectionTestUtils.setField(parent, "id", 20L);
        when(groupRepository.findByName("department")).thenReturn(Optional.of(department));
        when(groupRepository.findById(20L)).thenReturn(Optional.of(parent));
        when(employeeRepository.findById(applicant.getId())).thenReturn(Optional.of(applicant));
        when(employeeRepository.findFirstByPositionAndStatusOrderByIdAsc("代表取締役", "在籍"))
                .thenReturn(Optional.empty());
        when(employeeRepository.findAllByOrderByJoinDateDesc()).thenReturn(List.of(president, applicant));

        List<Employee> chain = ReflectionTestUtils.invokeMethod(leaveService, "resolveApprovalChain", applicant);

        assertThat(chain).containsExactly(president);
    }

    @Test
    void presidentDoesNotApproveOwnApplicationAsFallback() {
        Employee president = employee(1L, "president", "代表取締役");
        Group department = Group.create("department", "", president.getId(), null, null, true);
        ReflectionTestUtils.setField(department, "id", 10L);
        when(groupRepository.findByName("department")).thenReturn(Optional.of(department));
        when(employeeRepository.findFirstByPositionAndStatusOrderByIdAsc("代表取締役", "在籍"))
                .thenReturn(Optional.of(president));

        List<Employee> chain = ReflectionTestUtils.invokeMethod(leaveService, "resolveApprovalChain", president);

        assertThat(chain).isEmpty();
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
