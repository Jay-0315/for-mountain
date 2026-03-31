package com.mountain.for_mountain.domain.group.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class GroupResponse {
    private Long id;
    private String name;
    private String description;
    private Long leaderId;
    private String leaderName;
    private List<Long> memberIds;
    private Long parentGroupId;
    private String color;
}
