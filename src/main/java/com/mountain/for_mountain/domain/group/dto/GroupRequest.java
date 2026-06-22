package com.mountain.for_mountain.domain.group.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;

@Getter
public class GroupRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private Long leaderId;

    @NotNull
    private List<Long> memberIds;

    private Long parentGroupId;

    private String color;

    /** 휴가 승인 라인에서 제외할 그룹(예: 本部) 여부. */
    private Boolean excludeFromApproval;
}
