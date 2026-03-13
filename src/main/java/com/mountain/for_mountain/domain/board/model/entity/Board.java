package com.mountain.for_mountain.domain.board.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "board")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 100)
    private String author;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(length = 255)
    private String imageName;

    @Column(columnDefinition = "LONGTEXT")
    private String imageData;

    @Column(length = 255)
    private String videoName;

    @Column(columnDefinition = "LONGTEXT")
    private String videoData;

    @Column(length = 255)
    private String attachmentName;

    @Column(columnDefinition = "LONGTEXT")
    private String attachmentData;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Board(
            String title,
            String content,
            String author,
            String category,
            String imageName,
            String imageData,
            String videoName,
            String videoData,
            String attachmentName,
            String attachmentData
    ) {
        this.title = title;
        this.content = content;
        this.author = author;
        this.category = category;
        this.imageName = imageName;
        this.imageData = imageData;
        this.videoName = videoName;
        this.videoData = videoData;
        this.attachmentName = attachmentName;
        this.attachmentData = attachmentData;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void update(
            String title,
            String content,
            String category,
            String imageName,
            String imageData,
            String videoName,
            String videoData,
            String attachmentName,
            String attachmentData
    ) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.imageName = imageName;
        this.imageData = imageData;
        this.videoName = videoName;
        this.videoData = videoData;
        this.attachmentName = attachmentName;
        this.attachmentData = attachmentData;
        this.updatedAt = LocalDateTime.now();
    }
}
