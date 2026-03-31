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
}
