package com.mountain.for_mountain.domain.auth.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Departments {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100, unique = true)
    private String name;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public static Departments create(String code, String name, Long parentId, Integer sortOrder) {
        Departments dept = new Departments();
        dept.code = code;
        dept.name = name;
        dept.parentId = parentId;
        dept.sortOrder = sortOrder;
        dept.active = true;
        dept.createdAt = LocalDateTime.now();
        dept.updatedAt = LocalDateTime.now();
        return dept;
    }
}
