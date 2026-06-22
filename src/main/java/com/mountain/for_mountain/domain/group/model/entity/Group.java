package com.mountain.for_mountain.domain.group.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "`groups`")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(name = "leader_id")
    private Long leaderId;

    @Column(name = "parent_group_id")
    private Long parentGroupId;

    @Column(length = 30)
    private String color;

    /** 휴가 승인 라인에서 제외할 그룹(예: 本部). null/false = 포함, true = 제외. */
    @Column(name = "exclude_from_approval")
    private Boolean excludeFromApproval;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public static Group create(String name, String description, Long leaderId, Long parentGroupId, String color, Boolean excludeFromApproval) {
        Group g = new Group();
        g.name = name;
        g.description = description;
        g.leaderId = leaderId;
        g.parentGroupId = parentGroupId;
        g.color = color;
        g.excludeFromApproval = excludeFromApproval;
        g.createdAt = LocalDateTime.now();
        g.updatedAt = LocalDateTime.now();
        return g;
    }

    public void update(String name, String description, Long leaderId, Long parentGroupId, String color, Boolean excludeFromApproval) {
        this.name = name;
        this.description = description;
        this.leaderId = leaderId;
        this.parentGroupId = parentGroupId;
        this.color = color;
        this.excludeFromApproval = excludeFromApproval;
        this.updatedAt = LocalDateTime.now();
    }

    public void clearLeader() {
        this.leaderId = null;
        this.updatedAt = LocalDateTime.now();
    }
}
