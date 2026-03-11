package com.mountain.for_mountain.domain.leave.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LeaveResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String department;
    private String leaveType;
    private String startDate;
    private String endDate;
    private Integer days;
    private String reason;
    private String status;
    private String appliedAt;
}
