package com.mountain.for_mountain.domain.leave.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class LeaveStatusUpdateRequest {
    @NotBlank
    private String status;

    @Size(max = 500)
    private String rejectReason;
}
