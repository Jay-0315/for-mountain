package com.mountain.for_mountain.domain.leave.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class LeaveUpdateRequest {

    @NotBlank
    private String leaveType;

    @NotBlank
    private String startDate;

    @NotBlank
    private String endDate;

    @NotNull
    private Integer days;

    private String reason;
}
