package com.mountain.for_mountain.domain.servicecategory.dto;

import com.mountain.for_mountain.domain.servicecategory.model.entity.ServiceCategory;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ServiceCategoryResponse {
    private Long id;
    private String slug;
    private String name;
    private String iconKey;
    private Integer sortOrder;
    private String createdAt;
    private String updatedAt;

    public ServiceCategoryResponse(ServiceCategory category) {
        this(
                category.getId(),
                category.getSlug(),
                category.getName(),
                category.getIconKey(),
                category.getSortOrder(),
                category.getCreatedAt().toString(),
                category.getUpdatedAt().toString()
        );
    }
}
