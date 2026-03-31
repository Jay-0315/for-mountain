package com.mountain.for_mountain.domain.serviceitem.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ServiceItemRequest {

    @NotBlank
    private String category;

    @NotBlank
    private String title;

    private String summary;

    @NotBlank
    private String content;

    private List<ServiceContentBlockDto> contentBlocks;

    private String videoName;

    private String videoData;

    private String linkUrl;

    private String imageName;

    private String imageData;

    private List<MediaAssetDto> imageAssets;

    private String attachmentName;

    private String attachmentData;

    private List<MediaAssetDto> attachmentAssets;

    private List<MediaAssetDto> videoAssets;
}
