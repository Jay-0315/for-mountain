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

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(length = 30)
    private String color;

    @Column(name = "line_works_org_unit_id", unique = true, length = 100)
    private String lineWorksOrgUnitId;

    @Column(name = "line_works_external_key", unique = true, length = 100)
    private String lineWorksExternalKey;

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
        g.displayOrder = 0;
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

    public void syncLineWorksIdentity(String orgUnitId, String externalKey) {
        this.lineWorksOrgUnitId = orgUnitId;
        this.lineWorksExternalKey = externalKey;
        this.updatedAt = LocalDateTime.now();
    }

    public void syncFromLineWorks(String name, String description, Long leaderId, Long parentGroupId,
                                  String orgUnitId, String externalKey) {
        this.name = name;
        this.description = description;
        this.leaderId = leaderId;
        this.parentGroupId = parentGroupId;
        this.lineWorksOrgUnitId = orgUnitId;
        this.lineWorksExternalKey = externalKey;
        this.updatedAt = LocalDateTime.now();
    }

    public void clearLeader() {
        this.leaderId = null;
        this.updatedAt = LocalDateTime.now();
    }

    public void clearParent() {
        this.parentGroupId = null;
        this.updatedAt = LocalDateTime.now();
    }

    public void syncDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
        this.updatedAt = LocalDateTime.now();
    }

    public void moveToParent(Long parentGroupId) {
        this.parentGroupId = parentGroupId;
        this.updatedAt = LocalDateTime.now();
    }

    public void syncLeader(Long leaderId) {
        this.leaderId = leaderId;
        this.updatedAt = LocalDateTime.now();
    }
}
