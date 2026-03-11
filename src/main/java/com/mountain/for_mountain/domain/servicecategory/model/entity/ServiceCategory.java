package com.mountain.for_mountain.domain.servicecategory.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_categories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ServiceCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String slug;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "emoji", nullable = false, length = 30)
    private String iconKey;

    @Column(nullable = false)
    private Integer sortOrder;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public static ServiceCategory create(String slug, String name, String iconKey, Integer sortOrder) {
        ServiceCategory category = new ServiceCategory();
        category.slug = slug;
        category.name = name;
        category.iconKey = iconKey;
        category.sortOrder = sortOrder;
        category.createdAt = LocalDateTime.now();
        category.updatedAt = LocalDateTime.now();
        return category;
    }

    public void update(String name, String iconKey) {
        this.name = name;
        this.iconKey = iconKey;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
        this.updatedAt = LocalDateTime.now();
    }
}
