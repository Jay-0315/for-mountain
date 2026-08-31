package com.mountain.for_mountain.domain.lineworks.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class LineWorksDirectoryCompareResponse {
    private boolean enabled;
    private int usersFetched;
    private int orgUnitsFetched;
    private List<EmployeeDiff> employeeDiffs;
    private List<GroupDiff> groupDiffs;
    private List<GroupMembershipDiff> groupMembershipDiffs;
    private List<UnmatchedLineWorksUser> unmatchedLineWorksUsers;
    private List<UnmatchedEmployee> unmatchedEmployees;
    private List<UnmatchedOrgUnit> unmatchedOrgUnits;
    private List<UnmatchedGroup> unmatchedGroups;
    private String message;

    public static LineWorksDirectoryCompareResponse disabled() {
        return new LineWorksDirectoryCompareResponse(false, 0, 0, List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), List.of(),
                "LINE WORKS sync is disabled or credentials are incomplete.");
    }

    @Getter
    @AllArgsConstructor
    public static class EmployeeDiff {
        private Long employeeId;
        private String employeeNumber;
        private String lineWorksUserId;
        private List<FieldDiff> fields;
    }

    @Getter
    @AllArgsConstructor
    public static class GroupDiff {
        private Long groupId;
        private String groupName;
        private String lineWorksOrgUnitId;
        private List<FieldDiff> fields;
    }

    @Getter
    @AllArgsConstructor
    public static class GroupMembershipDiff {
        private Long groupId;
        private String groupName;
        private String lineWorksOrgUnitId;
        private List<EmployeeRef> addedEmployees;
        private List<EmployeeRef> removedEmployees;
        private List<UnmatchedGroupMember> unmatchedMembers;
    }

    @Getter
    @AllArgsConstructor
    public static class EmployeeRef {
        private Long employeeId;
        private String employeeNumber;
        private String name;
        private String email;
    }

    @Getter
    @AllArgsConstructor
    public static class UnmatchedGroupMember {
        private String lineWorksUserId;
        private String externalKey;
    }

    @Getter
    @AllArgsConstructor
    public static class UnmatchedOrgUnit {
        private String lineWorksOrgUnitId;
        private String externalKey;
        private String name;
    }

    @Getter
    @AllArgsConstructor
    public static class UnmatchedGroup {
        private Long groupId;
        private String name;
    }

    @Getter
    @AllArgsConstructor
    public static class FieldDiff {
        private String field;
        private String currentValue;
        private String lineWorksValue;
    }

    @Getter
    @AllArgsConstructor
    public static class UnmatchedLineWorksUser {
        private String userId;
        private String externalKey;
        private String email;
        private String name;
    }

    @Getter
    @AllArgsConstructor
    public static class UnmatchedEmployee {
        private Long employeeId;
        private String employeeNumber;
        private String email;
        private String name;
    }
}
