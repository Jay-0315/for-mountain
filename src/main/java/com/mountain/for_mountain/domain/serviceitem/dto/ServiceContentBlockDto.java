package com.mountain.for_mountain.domain.serviceitem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceContentBlockDto {
    private String type;
    private String content;
    private String name;
    private String url;
}
