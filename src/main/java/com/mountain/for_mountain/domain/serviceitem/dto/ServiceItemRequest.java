package com.mountain.for_mountain.domain.serviceitem.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ServiceItemRequest {

    @NotBlank
    private String category;

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    private String videoName;

    private String videoData;

    private String linkUrl;

    private String imageName;

    private String imageData;

    private String attachmentName;

    private String attachmentData;
}
