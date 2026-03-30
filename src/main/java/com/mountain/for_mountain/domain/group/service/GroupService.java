package com.mountain.for_mountain.domain.group.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.employee.repository.EmployeeRepository;
import com.mountain.for_mountain.domain.employee.model.entity.Employee;
import com.mountain.for_mountain.domain.group.dto.GroupRequest;
import com.mountain.for_mountain.domain.group.dto.GroupResponse;
import com.mountain.for_mountain.domain.group.model.entity.Group;
import com.mountain.for_mountain.domain.group.model.entity.GroupMember;
import com.mountain.for_mountain.domain.group.repository.GroupMemberRepository;
import com.mountain.for_mountain.domain.group.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final EmployeeRepository employeeRepository;

    public List<GroupResponse> getList() {
        return groupRepository.findAllByOrderByCreatedAtAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public GroupResponse create(GroupRequest request) {
        validateGroupRequest(null, request);
        Group group = groupRepository.save(Group.create(
                request.getName(),
                request.getDescription(),
                request.getLeaderId(),
                request.getParentGroupId()
        ));
        List<Long> syncedMemberIds = saveMembers(group.getId(), request.getLeaderId(), request.getMemberIds());
        syncEmployeeDepartments(syncedMemberIds, group.getName());
        return toResponse(group);
    }

    @Transactional
    public GroupResponse update(Long id, GroupRequest request) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));
        validateGroupRequest(id, request);
        List<Long> previousMemberIds = groupMemberRepository.findByGroupId(id).stream()
                .map(GroupMember::getEmployeeId)
                .toList();
        group.update(request.getName(), request.getDescription(), request.getLeaderId(), request.getParentGroupId());
        groupMemberRepository.deleteByGroupId(id);
        groupMemberRepository.flush();
        List<Long> syncedMemberIds = saveMembers(id, request.getLeaderId(), request.getMemberIds());
        syncEmployeeDepartments(syncedMemberIds, group.getName());
        restoreEmployeeDepartmentsAfterGroupChange(previousMemberIds, syncedMemberIds, group.getParentGroupId());
        return toResponse(group);
    }

    @Transactional
    public void delete(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));
        List<Long> previousMemberIds = groupMemberRepository.findByGroupId(id).stream()
                .map(GroupMember::getEmployeeId)
                .toList();
        groupMemberRepository.deleteByGroupId(id);
        groupRepository.delete(group);
        restoreEmployeeDepartmentsAfterGroupChange(previousMemberIds, List.of(), group.getParentGroupId());
    }

    private List<Long> saveMembers(Long groupId, Long leaderId, List<Long> memberIds) {
        List<Long> normalizedMemberIds = new ArrayList<>(memberIds);
        if (leaderId != null) {
            normalizedMemberIds.add(leaderId);
        }

        List<Long> distinctMemberIds = normalizedMemberIds.stream()
                .distinct()
                .toList();

        List<GroupMember> members = distinctMemberIds.stream()
                .map(employeeId -> GroupMember.of(groupId, employeeId))
                .toList();
        groupMemberRepository.saveAll(members);
        return distinctMemberIds;
    }

    private GroupResponse toResponse(Group group) {
        String leaderName = group.getLeaderId() == null
                ? "未設定"
                : employeeRepository.findById(group.getLeaderId())
                    .map(employee -> employee.getName())
                    .orElse("未設定");
        List<Long> memberIds = groupMemberRepository.findByGroupId(group.getId()).stream()
                .map(GroupMember::getEmployeeId)
                .toList();
        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getLeaderId(),
                leaderName,
                memberIds,
                group.getParentGroupId()
        );
    }

    private void validateGroupRequest(Long groupId, GroupRequest request) {
        if (!employeeRepository.existsById(request.getLeaderId())) {
            throw new CustomException(ErrorCode.ACCOUNT_NOT_FOUND);
        }

        for (Long memberId : request.getMemberIds()) {
            if (memberId == null || !employeeRepository.existsById(memberId)) {
                throw new CustomException(ErrorCode.INVALID_GROUP_MEMBER);
            }
        }

        Long parentGroupId = request.getParentGroupId();
        if (parentGroupId == null) {
            return;
        }

        if (groupId != null && groupId.equals(parentGroupId)) {
            throw new CustomException(ErrorCode.INVALID_GROUP_PARENT);
        }

        if (!groupRepository.existsById(parentGroupId)) {
            throw new CustomException(ErrorCode.INVALID_GROUP_PARENT);
        }

        if (groupId != null && isDescendant(groupId, parentGroupId)) {
            throw new CustomException(ErrorCode.INVALID_GROUP_PARENT);
        }
    }

    private boolean isDescendant(Long groupId, Long candidateParentId) {
        List<Group> allGroups = groupRepository.findAllByOrderByCreatedAtAsc();
        Set<Long> descendants = new HashSet<>();
        collectDescendants(groupId, allGroups, descendants);
        return descendants.contains(candidateParentId);
    }

    private void collectDescendants(Long groupId, List<Group> allGroups, Set<Long> descendants) {
        for (Group child : allGroups) {
            if (!groupId.equals(child.getParentGroupId()) || !descendants.add(child.getId())) {
                continue;
            }
            collectDescendants(child.getId(), allGroups, descendants);
        }
    }

    private void syncEmployeeDepartments(List<Long> employeeIds, String departmentName) {
        if (employeeIds.isEmpty()) {
            return;
        }

        employeeRepository.findAllById(employeeIds)
                .forEach(employee -> employee.updateDepartment(departmentName));
    }

    private void restoreEmployeeDepartmentsAfterGroupChange(List<Long> previousMemberIds, List<Long> currentMemberIds, Long fallbackParentGroupId) {
        Set<Long> removedMemberIds = new HashSet<>(previousMemberIds);
        removedMemberIds.removeAll(currentMemberIds);
        if (removedMemberIds.isEmpty()) {
            return;
        }

        String fallbackDepartment = null;
        if (fallbackParentGroupId != null) {
            fallbackDepartment = groupRepository.findById(fallbackParentGroupId)
                    .map(Group::getName)
                    .orElse(null);
        }

        for (Employee employee : employeeRepository.findAllById(removedMemberIds)) {
            String departmentToApply = resolveEmployeeDepartmentFromGroups(employee.getId());
            if (departmentToApply == null) {
                departmentToApply = fallbackDepartment;
            }
            if (departmentToApply != null && !departmentToApply.isBlank()) {
                employee.updateDepartment(departmentToApply);
            }
        }
    }

    private String resolveEmployeeDepartmentFromGroups(Long employeeId) {
        return groupRepository.findAllByOrderByCreatedAtAsc().stream()
                .filter(group -> groupMemberRepository.findByGroupId(group.getId()).stream()
                        .anyMatch(member -> member.getEmployeeId().equals(employeeId)))
                .map(Group::getName)
                .findFirst()
                .orElse(null);
    }
}
