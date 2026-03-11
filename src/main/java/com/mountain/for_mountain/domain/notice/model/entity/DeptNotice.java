package com.mountain.for_mountain.domain.notice.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "dept_notices")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DeptNotice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 부서명 또는 "全部署" (전 부서)
    @Column(nullable = false, length = 50)
    private String department;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 100)
    private String author;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public static DeptNotice create(String department, String title, String content, String author) {
        DeptNotice n = new DeptNotice();
        n.department = department;
        n.title = title;
        n.content = content;
        n.author = author;
        n.createdAt = LocalDateTime.now();
        n.updatedAt = LocalDateTime.now();
        return n;
    }

    public void update(String department, String title, String content, String author) {
        this.department = department;
        this.title = title;
        this.content = content;
        this.author = author;
        this.updatedAt = LocalDateTime.now();
    }
}
