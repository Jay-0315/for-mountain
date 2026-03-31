package com.mountain.for_mountain.domain.serviceitem.dto;

import com.mountain.for_mountain.domain.serviceitem.model.entity.ServiceItem;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ServiceItemResponse {
    private Long id;
    private String category;
    private String title;
    private String content;
    private List<ServiceContentBlockDto> contentBlocks;
    private String videoName;
    private String videoData;
    private List<MediaAssetDto> videoAssets;
    private String linkUrl;
    private String imageName;
    private String imageData;
    private List<MediaAssetDto> imageAssets;
    private String attachmentName;
    private String attachmentData;
    private List<MediaAssetDto> attachmentAssets;
    private Integer sortOrder;
    private String createdAt;
    private String updatedAt;
}
