package com.mountain.for_mountain.domain.notice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class InternalAnnouncementRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    private String content;

    @NotBlank
    @Size(max = 100)
    private String author;

    private boolean pinned;
}
