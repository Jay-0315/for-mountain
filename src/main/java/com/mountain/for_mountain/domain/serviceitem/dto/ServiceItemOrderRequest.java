package com.mountain.for_mountain.domain.serviceitem.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ServiceItemOrderRequest {

    @NotEmpty
    private List<Long> orderedIds;
}
