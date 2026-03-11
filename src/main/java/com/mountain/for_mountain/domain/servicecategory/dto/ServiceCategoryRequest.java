package com.mountain.for_mountain.domain.servicecategory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ServiceCategoryRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String iconKey;
}
