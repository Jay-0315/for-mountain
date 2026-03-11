package com.mountain.for_mountain.domain.group.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "group_members",
        uniqueConstraints = @UniqueConstraint(columnNames = {"group_id", "employee_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    public static GroupMember of(Long groupId, Long employeeId) {
        GroupMember gm = new GroupMember();
        gm.groupId = groupId;
        gm.employeeId = employeeId;
        return gm;
    }
}
