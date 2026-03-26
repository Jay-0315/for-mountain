package com.mountain.for_mountain.domain.group.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.employee.repository.EmployeeRepository;
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
import java.util.List;

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
        Group group = groupRepository.save(Group.create(
                request.getName(),
                request.getDescription(),
                request.getLeaderId(),
                request.getParentGroupId()
        ));
        saveMembers(group.getId(), request.getLeaderId(), request.getMemberIds());
        return toResponse(group);
    }

    @Transactional
    public GroupResponse update(Long id, GroupRequest request) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.ACCESS_DENIED));
        group.update(request.getName(), request.getDescription(), request.getLeaderId(), request.getParentGroupId());
        groupMemberRepository.deleteByGroupId(id);
        saveMembers(id, request.getLeaderId(), request.getMemberIds());
        return toResponse(group);
    }

    @Transactional
    public void delete(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.ACCESS_DENIED));
        groupMemberRepository.deleteByGroupId(id);
        groupRepository.delete(group);
    }

    private void saveMembers(Long groupId, Long leaderId, List<Long> memberIds) {
        List<Long> normalizedMemberIds = new ArrayList<>(memberIds);
        if (leaderId != null) {
            normalizedMemberIds.add(leaderId);
        }

        List<GroupMember> members = normalizedMemberIds.stream()
                .distinct()
                .map(employeeId -> GroupMember.of(groupId, employeeId))
                .toList();
        groupMemberRepository.saveAll(members);
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
}
