package com.mountain.for_mountain.domain.leave.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class LeaveStatusUpdateRequest {
    @NotBlank
    private String status;
}
