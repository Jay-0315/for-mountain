package com.mountain.for_mountain.domain.serviceitem.dto;

import com.mountain.for_mountain.domain.serviceitem.model.entity.ServiceItem;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ServiceItemResponse {
    private Long id;
    private String category;
    private String title;
    private String content;
    private String videoName;
    private String videoData;
    private String linkUrl;
    private String imageName;
    private String imageData;
    private String attachmentName;
    private String attachmentData;
    private Integer sortOrder;
    private String createdAt;
    private String updatedAt;

    public ServiceItemResponse(ServiceItem item) {
        this(
                item.getId(),
                item.getCategory(),
                item.getTitle(),
                item.getContent(),
                item.getVideoName(),
                item.getVideoData(),
                item.getLinkUrl(),
                item.getImageName(),
                item.getImageData(),
                item.getAttachmentName(),
                item.getAttachmentData(),
                item.getSortOrder(),
                item.getCreatedAt().toString(),
                item.getUpdatedAt().toString()
        );
    }
}
