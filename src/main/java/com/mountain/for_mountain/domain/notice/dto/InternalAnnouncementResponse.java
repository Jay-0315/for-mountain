package com.mountain.for_mountain.domain.notice.dto;

import com.mountain.for_mountain.domain.notice.model.entity.InternalAnnouncement;
import lombok.Getter;

@Getter
public class InternalAnnouncementResponse {
    private final Long id;
    private final String title;
    private final String content;
    private final String author;
    private final boolean pinned;
    private final String createdAt;

    public InternalAnnouncementResponse(InternalAnnouncement announcement) {
        this.id = announcement.getId();
        this.title = announcement.getTitle();
        this.content = announcement.getContent();
        this.author = announcement.getAuthor();
        this.pinned = announcement.isPinned();
        this.createdAt = announcement.getCreatedAt().toString();
    }
}
