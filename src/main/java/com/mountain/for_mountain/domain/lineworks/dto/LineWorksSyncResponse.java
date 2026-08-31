package com.mountain.for_mountain.domain.lineworks.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LineWorksSyncResponse {
    private boolean enabled;
    private String mode;
    private int usersFetched;
    private int employeesLinked;
    private int employeesAlreadyLinked;
    private int employeesCreated;
    private int employeesSkipped;
    private int orgUnitsFetched;
    private int groupsLinked;
    private int groupsAlreadyLinked;
    private int groupMembersSynced;
    private int groupMembersSkipped;
    private String message;

    public static LineWorksSyncResponse disabled() {
        return new LineWorksSyncResponse(false, "link-and-members", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "LINE WORKS sync is disabled or credentials are incomplete.");
    }
}
