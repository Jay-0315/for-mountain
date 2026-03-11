package com.mountain.for_mountain.domain.serviceitem.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ServiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 255)
    private String videoName;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String videoData;

    @Column(length = 1000)
    private String linkUrl;

    @Column(length = 255)
    private String imageName;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String imageData;

    @Column(length = 255)
    private String attachmentName;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String attachmentData;

    @Column(nullable = false)
    private Integer sortOrder;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public static ServiceItem create(
            String category,
            String title,
            String content,
            String videoName,
            String videoData,
            String linkUrl,
            String imageName,
            String imageData,
            String attachmentName,
            String attachmentData,
            Integer sortOrder
    ) {
        ServiceItem item = new ServiceItem();
        item.category = category;
        item.title = title;
        item.content = content;
        item.videoName = videoName;
        item.videoData = videoData;
        item.linkUrl = linkUrl;
        item.imageName = imageName;
        item.imageData = imageData;
        item.attachmentName = attachmentName;
        item.attachmentData = attachmentData;
        item.sortOrder = sortOrder;
        item.createdAt = LocalDateTime.now();
        item.updatedAt = LocalDateTime.now();
        return item;
    }

    public void update(
            String category,
            String title,
            String content,
            String videoName,
            String videoData,
            String linkUrl,
            String imageName,
            String imageData,
            String attachmentName,
            String attachmentData
    ) {
        this.category = category;
        this.title = title;
        this.content = content;
        this.videoName = videoName;
        this.videoData = videoData;
        this.linkUrl = linkUrl;
        this.imageName = imageName;
        this.imageData = imageData;
        this.attachmentName = attachmentName;
        this.attachmentData = attachmentData;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
        this.updatedAt = LocalDateTime.now();
    }
}
