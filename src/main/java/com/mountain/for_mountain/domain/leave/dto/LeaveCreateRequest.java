package com.mountain.for_mountain.domain.leave.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

/**
 * 신청자(employeeId)는 이 DTO 에 담지 않는다.
 * 서버가 인증 토큰의 주체로 결정하므로 클라이언트가 지정할 수 없다.
 */
@Getter
public class LeaveCreateRequest {

    @NotBlank
    private String leaveType;

    @NotBlank
    private String startDate;

    @NotBlank
    private String endDate;

    @NotNull
    private Double days;

    private String reason;
}
