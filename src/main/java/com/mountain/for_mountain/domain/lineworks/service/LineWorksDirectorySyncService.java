package com.mountain.for_mountain.domain.lineworks.service;

import com.mountain.for_mountain.domain.employee.model.entity.Employee;
import com.mountain.for_mountain.domain.employee.repository.EmployeeRepository;
import com.mountain.for_mountain.domain.group.model.entity.Group;
import com.mountain.for_mountain.domain.group.repository.GroupRepository;
import com.mountain.for_mountain.domain.group.repository.GroupMemberRepository;
import com.mountain.for_mountain.domain.group.model.entity.GroupMember;
import com.mountain.for_mountain.domain.lineworks.client.LineWorksDirectoryClient;
import com.mountain.for_mountain.domain.lineworks.dto.LineWorksDirectoryCompareResponse;
import com.mountain.for_mountain.domain.lineworks.dto.LineWorksSyncResponse;
import com.mountain.for_mountain.domain.lineworks.model.LineWorksOrgUnit;
import com.mountain.for_mountain.domain.lineworks.model.LineWorksUser;
import com.mountain.for_mountain.domain.lineworks.model.LineWorksOrgUnitMember;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.text.Normalizer;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LineWorksDirectorySyncService {

    private final LineWorksDirectoryClient lineWorksDirectoryClient;
    private final EmployeeRepository employeeRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

    @Scheduled(cron = "${line-works.sync-cron:0 15 2 * * *}")
    public void syncScheduled() {
        if (!lineWorksDirectoryClient.isConfigured()) {
            return;
        }
        try {
            LineWorksSyncResponse result = syncDirectory();
            log.info("LINE WORKS directory link sync completed. users={}, orgUnits={}, employeesLinked={}, groupsLinked={}, skipped={}",
                    result.getUsersFetched(),
                    result.getOrgUnitsFetched(),
                    result.getEmployeesLinked(),
                    result.getGroupsLinked(),
                    result.getEmployeesSkipped());
        } catch (Exception e) {
            log.error("LINE WORKS directory sync failed.", e);
        }
    }

    @Transactional
    public LineWorksSyncResponse syncDirectory() {
        if (!lineWorksDirectoryClient.isConfigured()) {
            return LineWorksSyncResponse.disabled();
        }

        List<LineWorksUser> users = lineWorksDirectoryClient.getUsers();
        List<LineWorksOrgUnit> orgUnits = lineWorksDirectoryClient.getOrgUnits();
        Map<String, String> orgUnitNameById = orgUnits.stream()
                .filter(orgUnit -> hasText(orgUnit.orgUnitId()))
                .collect(Collectors.toMap(LineWorksOrgUnit::orgUnitId, LineWorksOrgUnit::name, (left, right) -> left));
        SyncCounter employeeCounter = linkEmployees(users, orgUnitNameById);
        employeeCounter.created += provisionNewEmployees(users, orgUnitNameById);
        SyncCounter groupCounter = linkGroups(orgUnits);
        SyncCounter membershipCounter = syncGroupMembers(orgUnits);
        removeLocalOnlyGroups();

        return new LineWorksSyncResponse(
                true,
                "link-and-members",
                users.size(),
                employeeCounter.linked,
                employeeCounter.alreadyLinked,
                employeeCounter.created,
                employeeCounter.skipped,
                orgUnits.size(),
                groupCounter.linked,
                groupCounter.alreadyLinked,
                membershipCounter.linked,
                membershipCounter.skipped,
                "LINE WORKS directory link sync completed. Existing employee, group, and leave data were preserved."
        );
    }

    public LineWorksDirectoryCompareResponse compareDirectory() {
        if (!lineWorksDirectoryClient.isConfigured()) {
            return LineWorksDirectoryCompareResponse.disabled();
        }

        List<LineWorksUser> users = lineWorksDirectoryClient.getUsers();
        List<LineWorksOrgUnit> orgUnits = lineWorksDirectoryClient.getOrgUnits();
        List<Employee> employees = employeeRepository.findAllByOrderByJoinDateDesc();
        List<Group> groups = groupRepository.findAllByOrderByCreatedAtAsc();
        Map<String, String> orgUnitNameById = orgUnits.stream()
                .filter(orgUnit -> hasText(orgUnit.orgUnitId()))
                .collect(Collectors.toMap(
                        LineWorksOrgUnit::orgUnitId,
                        orgUnit -> normalizeForCompare(orgUnit.name()),
                        (left, right) -> left
                ));

        List<LineWorksDirectoryCompareResponse.EmployeeDiff> employeeDiffs = new ArrayList<>();
        List<LineWorksDirectoryCompareResponse.UnmatchedLineWorksUser> unmatchedUsers = new ArrayList<>();
        Set<Long> matchedEmployeeIds = new java.util.HashSet<>();

        for (LineWorksUser user : users) {
            Optional<Employee> employee = findEmployeeToLink(user);
            if (employee.isEmpty()) {
                unmatchedUsers.add(new LineWorksDirectoryCompareResponse.UnmatchedLineWorksUser(
                        user.userId(),
                        user.externalKey(),
                        user.email(),
                        user.name()
                ));
                continue;
            }

            matchedEmployeeIds.add(employee.get().getId());
            List<LineWorksDirectoryCompareResponse.FieldDiff> fields = compareEmployee(employee.get(), user, orgUnitNameById);
            if (!fields.isEmpty()) {
                employeeDiffs.add(new LineWorksDirectoryCompareResponse.EmployeeDiff(
                        employee.get().getId(),
                        employee.get().getEmployeeNumber(),
                        user.userId(),
                        fields
                ));
            }
        }

        List<LineWorksDirectoryCompareResponse.UnmatchedEmployee> unmatchedEmployees = employees.stream()
                .filter(employee -> !matchedEmployeeIds.contains(employee.getId()))
                .map(employee -> new LineWorksDirectoryCompareResponse.UnmatchedEmployee(
                        employee.getId(),
                        employee.getEmployeeNumber(),
                        employee.getEmail(),
                        employee.getName()
                ))
                .toList();

        List<LineWorksDirectoryCompareResponse.GroupDiff> groupDiffs = new ArrayList<>();
        List<LineWorksDirectoryCompareResponse.GroupMembershipDiff> membershipDiffs = new ArrayList<>();
        List<LineWorksDirectoryCompareResponse.UnmatchedOrgUnit> unmatchedOrgUnits = new ArrayList<>();
        Set<Long> matchedGroupIds = new java.util.HashSet<>();
        Map<String, Employee> employeeByLineWorksId = employees.stream()
                .filter(employee -> hasText(employee.getLineWorksUserId()))
                .collect(Collectors.toMap(Employee::getLineWorksUserId, employee -> employee, (left, right) -> left));
        for (LineWorksOrgUnit orgUnit : orgUnits) {
            Optional<Group> group = findGroupToLink(orgUnit);
            if (group.isEmpty()) {
                unmatchedOrgUnits.add(new LineWorksDirectoryCompareResponse.UnmatchedOrgUnit(
                        orgUnit.orgUnitId(), orgUnit.externalKey(), orgUnit.name()));
                continue;
            }
            matchedGroupIds.add(group.get().getId());
            List<LineWorksDirectoryCompareResponse.FieldDiff> fields = compareGroup(group.get(), orgUnit, groups);
            if (!fields.isEmpty()) {
                groupDiffs.add(new LineWorksDirectoryCompareResponse.GroupDiff(
                        group.get().getId(),
                        group.get().getName(),
                        orgUnit.orgUnitId(),
                        fields
                ));
            }
            compareGroupMembership(group.get(), orgUnit, membershipDiffs, employeeByLineWorksId);
        }

        List<LineWorksDirectoryCompareResponse.UnmatchedGroup> unmatchedGroups = groups.stream()
                .filter(group -> !matchedGroupIds.contains(group.getId()))
                .map(group -> new LineWorksDirectoryCompareResponse.UnmatchedGroup(group.getId(), group.getName()))
                .toList();

        return new LineWorksDirectoryCompareResponse(
                true,
                users.size(),
                orgUnits.size(),
                employeeDiffs,
                groupDiffs,
                membershipDiffs,
                unmatchedUsers,
                unmatchedEmployees,
                unmatchedOrgUnits,
                unmatchedGroups,
                "LINE WORKS directory comparison completed. No data was changed."
        );
    }

    private void compareGroupMembership(
            Group group,
            LineWorksOrgUnit orgUnit,
            List<LineWorksDirectoryCompareResponse.GroupMembershipDiff> result,
            Map<String, Employee> employeeByLineWorksId
    ) {
        Set<Long> currentIds = groupMemberRepository.findByGroupId(group.getId()).stream()
                .map(GroupMember::getEmployeeId)
                .collect(Collectors.toSet());
        Set<Long> remoteIds = new java.util.HashSet<>();
        List<LineWorksDirectoryCompareResponse.UnmatchedGroupMember> unmatched = new ArrayList<>();
        for (LineWorksOrgUnitMember remoteMember : lineWorksDirectoryClient.getOrgUnitMembers(orgUnit.orgUnitId())) {
            Employee employee = employeeByLineWorksId.get(remoteMember.id());
            if (employee == null && hasText(remoteMember.externalKey())) {
                employee = employeeRepository.findByLineWorksExternalKey(remoteMember.externalKey())
                        .orElseGet(() -> employeeRepository.findByEmployeeNumber(remoteMember.externalKey()).orElse(null));
            }
            if (employee == null) {
                unmatched.add(new LineWorksDirectoryCompareResponse.UnmatchedGroupMember(
                        remoteMember.id(), remoteMember.externalKey()));
            } else {
                remoteIds.add(employee.getId());
            }
        }
        List<LineWorksDirectoryCompareResponse.EmployeeRef> added = remoteIds.stream()
                .filter(id -> !currentIds.contains(id))
                .map(this::toEmployeeRef)
                .toList();
        List<LineWorksDirectoryCompareResponse.EmployeeRef> removed = currentIds.stream()
                .filter(id -> !remoteIds.contains(id))
                .map(this::toEmployeeRef)
                .toList();
        if (!added.isEmpty() || !removed.isEmpty() || !unmatched.isEmpty()) {
            result.add(new LineWorksDirectoryCompareResponse.GroupMembershipDiff(
                    group.getId(), group.getName(), orgUnit.orgUnitId(), added, removed, unmatched));
        }
    }

    private LineWorksDirectoryCompareResponse.EmployeeRef toEmployeeRef(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .map(employee -> new LineWorksDirectoryCompareResponse.EmployeeRef(
                        employee.getId(), employee.getEmployeeNumber(), employee.getName(), employee.getEmail()))
                .orElse(new LineWorksDirectoryCompareResponse.EmployeeRef(employeeId, "", "", ""));
    }

    private SyncCounter linkEmployees(List<LineWorksUser> users, Map<String, String> orgUnitNameById) {
        SyncCounter counter = new SyncCounter();
        for (LineWorksUser user : users) {
            if (!hasText(user.userId())) {
                counter.skipped++;
                continue;
            }

            Optional<Employee> existing = findEmployeeToLink(user);
            if (existing.isEmpty()) {
                counter.skipped++;
                continue;
            }

            Employee employee = existing.get();
            employee.syncDirectoryProfile(
                    user.name(),
                    user.email(),
                    orgUnitNameById.getOrDefault(user.orgUnitId(), ""),
                    user.position(),
                    user.status()
            );
            if (user.userId().equals(employee.getLineWorksUserId())) {
                counter.alreadyLinked++;
                continue;
            }

            employee.syncLineWorksIdentity(user.userId(), emptyToNull(user.externalKey()));
            counter.linked++;
        }
        return counter;
    }

    private int provisionNewEmployees(List<LineWorksUser> users, Map<String, String> orgUnitNameById) {
        int created = 0;
        for (LineWorksUser user : users) {
            if (!hasText(user.userId()) || !hasText(user.email()) || findEmployeeToLink(user).isPresent()) {
                continue;
            }
            String employeeNumber = hasText(user.externalKey())
                    ? user.externalKey().trim()
                    : "LW" + user.userId().replaceAll("[^A-Za-z0-9]", "").substring(0, Math.min(18, user.userId().replaceAll("[^A-Za-z0-9]", "").length()));
            if (employeeRepository.findByEmployeeNumber(employeeNumber).isPresent()) {
                continue;
            }
            String name = hasText(user.name()) ? user.name() : user.email();
            String department = orgUnitNameById.getOrDefault(user.orgUnitId(), "未設定");
            String position = hasText(user.position()) ? user.position() : "社員";
            employeeRepository.save(Employee.createFromLineWorks(
                    employeeNumber, name, department, position, user.email(), user.status(),
                    user.userId(), emptyToNull(user.externalKey())
            ));
            created++;
        }
        return created;
    }

    private SyncCounter linkGroups(List<LineWorksOrgUnit> orgUnits) {
        SyncCounter counter = new SyncCounter();
        Map<String, Group> groupsByOrgUnitId = new java.util.HashMap<>();
        for (LineWorksOrgUnit orgUnit : orgUnits) {
            if (!hasText(orgUnit.orgUnitId()) || !hasText(orgUnit.name())) {
                counter.skipped++;
                continue;
            }

            Group group = findGroupToLink(orgUnit).orElseGet(() -> {
                Long leaderId = findLeaderId(orgUnit.managerUserId()).orElse(null);
                Group created = groupRepository.save(Group.create(
                        orgUnit.name(), "LINE WORKS同期組織", leaderId, null, null, false));
                counter.linked++;
                return created;
            });
            groupsByOrgUnitId.put(orgUnit.orgUnitId(), group);
            if (orgUnit.orgUnitId().equals(group.getLineWorksOrgUnitId())) {
                counter.alreadyLinked++;
                continue;
            }
            group.syncLineWorksIdentity(orgUnit.orgUnitId(), emptyToNull(orgUnit.externalKey()));
            counter.linked++;
        }
        for (LineWorksOrgUnit orgUnit : orgUnits) {
            Group group = groupsByOrgUnitId.get(orgUnit.orgUnitId());
            if (group == null) continue;
            Long parentId = Optional.ofNullable(groupsByOrgUnitId.get(orgUnit.parentOrgUnitId()))
                    .map(Group::getId)
                    .orElse(null);
            Long leaderId = findLeaderId(orgUnit.managerUserId()).orElse(group.getLeaderId());
            group.syncFromLineWorks(orgUnit.name(), group.getDescription(), leaderId, parentId,
                    group.getLineWorksOrgUnitId(), group.getLineWorksExternalKey());
        }
        return counter;
    }

    private Optional<Long> findLeaderId(String lineWorksUserId) {
        if (!hasText(lineWorksUserId)) return Optional.empty();
        return employeeRepository.findByLineWorksUserId(lineWorksUserId).map(Employee::getId);
    }

    private SyncCounter syncGroupMembers(List<LineWorksOrgUnit> orgUnits) {
        SyncCounter counter = new SyncCounter();
        for (LineWorksOrgUnit orgUnit : orgUnits) {
            Optional<Group> group = findGroupToLink(orgUnit);
            if (group.isEmpty()) {
                continue;
            }

            List<Long> employeeIds = new ArrayList<>();
            Long managerId = null;
            for (LineWorksOrgUnitMember remoteMember : lineWorksDirectoryClient.getOrgUnitMembers(orgUnit.orgUnitId())) {
                Optional<Employee> employee = findEmployeeByOrgUnitMember(remoteMember);
                if (employee.isEmpty()) {
                    counter.skipped++;
                    continue;
                }
                employeeIds.add(employee.get().getId());
                if (remoteMember.manager()) {
                    managerId = employee.get().getId();
                }
            }

            // Keep every direct LINE WORKS membership. Employees may belong to multiple org units.
            groupMemberRepository.deleteByGroupId(group.get().getId());
            groupMemberRepository.flush();
            for (Long employeeId : employeeIds.stream().distinct().toList()) {
                groupMemberRepository.save(GroupMember.of(group.get().getId(), employeeId));
                counter.linked++;
            }
            if (managerId != null) {
                group.get().syncLeader(managerId);
            }
        }
        return counter;
    }

    /** LINE WORKS를 원본으로 사용할 때 로컬 전용 그룹을 정리한다. */
    private void removeLocalOnlyGroups() {
        List<Group> allGroups = groupRepository.findAllByOrderByCreatedAtAsc();
        List<Group> localOnly = allGroups.stream()
                .filter(group -> !hasText(group.getLineWorksOrgUnitId()))
                .toList();
        if (localOnly.isEmpty()) return;

        Set<Long> localOnlyIds = localOnly.stream().map(Group::getId).collect(Collectors.toSet());
        for (Group group : allGroups) {
            if (!localOnlyIds.contains(group.getParentGroupId()) || localOnlyIds.contains(group.getId())) continue;
            group.clearParent();
        }
        groupMemberRepository.deleteByGroupIdIn(localOnly.stream().map(Group::getId).toList());
        groupRepository.deleteAll(localOnly);
        log.info("Removed local-only groups during LINE WORKS sync. count={}", localOnly.size());
    }

    private Optional<Employee> findEmployeeByOrgUnitMember(LineWorksOrgUnitMember member) {
        if (hasText(member.id())) {
            Optional<Employee> byUserId = employeeRepository.findByLineWorksUserId(member.id());
            if (byUserId.isPresent()) return byUserId;
        }
        if (hasText(member.externalKey())) {
            Optional<Employee> byExternalKey = employeeRepository.findByLineWorksExternalKey(member.externalKey());
            if (byExternalKey.isPresent()) return byExternalKey;
            return employeeRepository.findByEmployeeNumber(member.externalKey());
        }
        return Optional.empty();
    }

    private Optional<Employee> findEmployeeToLink(LineWorksUser user) {
        if (hasText(user.userId())) {
            Optional<Employee> byUserId = employeeRepository.findByLineWorksUserId(user.userId());
            if (byUserId.isPresent()) {
                return byUserId;
            }
        }
        if (hasText(user.externalKey())) {
            Optional<Employee> byExternalKey = employeeRepository.findByLineWorksExternalKey(user.externalKey());
            if (byExternalKey.isPresent()) {
                return byExternalKey;
            }
        }
        if (hasText(user.externalKey())) {
            Optional<Employee> byEmployeeNumber = employeeRepository.findByEmployeeNumber(user.externalKey());
            if (byEmployeeNumber.isPresent()) {
                return byEmployeeNumber;
            }
        }
        if (hasText(user.email())) {
            return employeeRepository.findAllByOrderByJoinDateDesc().stream()
                    .filter(employee -> user.email().equalsIgnoreCase(employee.getEmail()))
                    .findFirst();
        }
        return Optional.empty();
    }

    private Optional<Group> findGroupToLink(LineWorksOrgUnit orgUnit) {
        if (hasText(orgUnit.orgUnitId())) {
            Optional<Group> byOrgUnitId = groupRepository.findByLineWorksOrgUnitId(orgUnit.orgUnitId());
            if (byOrgUnitId.isPresent()) {
                return byOrgUnitId;
            }
        }
        if (hasText(orgUnit.externalKey())) {
            Optional<Group> byExternalKey = groupRepository.findByLineWorksExternalKey(orgUnit.externalKey());
            if (byExternalKey.isPresent()) {
                return byExternalKey;
            }
        }
        List<Group> groups = groupRepository.findAllByOrderByCreatedAtAsc();
        return groups.stream()
                .filter(group -> equivalentGroupName(group.getName(), orgUnit.name())
                        || (hasText(orgUnit.externalKey()) && equivalentGroupName(group.getName(), orgUnit.externalKey())))
                .findFirst();
    }

    private boolean equivalentGroupName(String left, String right) {
        String a = normalizeGroupName(left);
        String b = normalizeGroupName(right);
        if (a.equals(b)) return true;
        return (a.equals("パート1") && b.equals("パート（アルバイト含）"))
                || (b.equals("パート1") && a.equals("パート（アルバイト含）"))
                || (a.equals("インフラグループ") && b.equals("インフラ事業部"))
                || (b.equals("インフラグループ") && a.equals("インフラ事業部"))
                || (a.equals("ソリューション部") && b.equals("ソリューション事業部"))
                || (b.equals("ソリューション部") && a.equals("ソリューション事業部"));
    }

    private String normalizeGroupName(String value) {
        if (value == null) return "";
        return Normalizer.normalize(value, Normalizer.Form.NFKC)
                .replace("Part", "パート")
                .replace("part", "パート")
                .replaceAll("\\s+", "")
                .trim();
    }

    private List<LineWorksDirectoryCompareResponse.FieldDiff> compareEmployee(
            Employee employee,
            LineWorksUser user,
            Map<String, String> orgUnitNameById
    ) {
        List<LineWorksDirectoryCompareResponse.FieldDiff> fields = new ArrayList<>();
        addDiff(fields, "name", employee.getName(), user.name());
        addDiff(fields, "email", employee.getEmail(), user.email());
        addDiff(fields, "position", employee.getPosition(), user.position());
        addDiff(fields, "status", employee.getStatus(), user.status());
        addDiff(fields, "department", employee.getDepartment(), orgUnitNameById.getOrDefault(user.orgUnitId(), ""));
        return fields;
    }

    private List<LineWorksDirectoryCompareResponse.FieldDiff> compareGroup(
            Group group,
            LineWorksOrgUnit orgUnit,
            List<Group> groups
    ) {
        List<LineWorksDirectoryCompareResponse.FieldDiff> fields = new ArrayList<>();
        addDiff(fields, "name", group.getName(), orgUnit.name());
        String currentParentName = groups.stream()
                .filter(item -> item.getId().equals(group.getParentGroupId()))
                .map(Group::getName)
                .findFirst()
                .orElse("");
        addDiff(fields, "parentGroup", currentParentName, resolveLineWorksOrgUnitName(orgUnit.parentOrgUnitId()));
        String currentLeaderUserId = group.getLeaderId() == null
                ? ""
                : employeeRepository.findById(group.getLeaderId())
                    .map(Employee::getLineWorksUserId)
                    .orElse("");
        addDiff(fields, "leader", currentLeaderUserId, orgUnit.managerUserId());
        return fields;
    }

    private String resolveLineWorksOrgUnitName(String orgUnitId) {
        if (!hasText(orgUnitId)) {
            return "";
        }
        return groupRepository.findByLineWorksOrgUnitId(orgUnitId)
                .map(Group::getName)
                .orElse("");
    }

    private void addDiff(List<LineWorksDirectoryCompareResponse.FieldDiff> fields, String field, String currentValue, String lineWorksValue) {
        String current = normalizeForCompare(currentValue);
        String remote = normalizeForCompare(lineWorksValue);
        if (remote.isEmpty() || current.equals(remote)) {
            return;
        }
        fields.add(new LineWorksDirectoryCompareResponse.FieldDiff(field, current, remote));
    }

    private String normalizeForCompare(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String emptyToNull(String value) {
        return hasText(value) ? value.trim() : null;
    }

    private static final class SyncCounter {
        private int linked;
        private int alreadyLinked;
        private int created;
        private int skipped;
    }
}
