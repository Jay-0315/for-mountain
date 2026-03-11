package com.mountain.for_mountain.domain.notice.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "internal_announcements")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InternalAnnouncement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 100)
    private String author;

    @Column(nullable = false)
    private boolean pinned;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public static InternalAnnouncement create(String title, String content, String author, boolean pinned) {
        InternalAnnouncement a = new InternalAnnouncement();
        a.title = title;
        a.content = content;
        a.author = author;
        a.pinned = pinned;
        a.createdAt = LocalDateTime.now();
        a.updatedAt = LocalDateTime.now();
        return a;
    }

    public void update(String title, String content, String author, boolean pinned) {
        this.title = title;
        this.content = content;
        this.author = author;
        this.pinned = pinned;
        this.updatedAt = LocalDateTime.now();
    }
}
