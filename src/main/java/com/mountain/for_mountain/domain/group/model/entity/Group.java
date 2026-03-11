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

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public static Group create(String name, String description, Long leaderId) {
        Group g = new Group();
        g.name = name;
        g.description = description;
        g.leaderId = leaderId;
        g.createdAt = LocalDateTime.now();
        g.updatedAt = LocalDateTime.now();
        return g;
    }

    public void update(String name, String description, Long leaderId) {
        this.name = name;
        this.description = description;
        this.leaderId = leaderId;
        this.updatedAt = LocalDateTime.now();
    }

    public void clearLeader() {
        this.leaderId = null;
        this.updatedAt = LocalDateTime.now();
    }
}
