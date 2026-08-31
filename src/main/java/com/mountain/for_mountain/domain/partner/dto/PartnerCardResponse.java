package com.mountain.for_mountain.domain.partner.dto;

import com.mountain.for_mountain.domain.partner.model.entity.PartnerCard;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class PartnerCardResponse {
    private Long id;
    private String imageSrc;
    private String linkUrl;
    private Integer sortOrder;
    private String createdAt;
    private String updatedAt;

    public PartnerCardResponse(PartnerCard card) {
        this(
                card.getId(),
                card.getImageSrc(),
                card.getLinkUrl(),
                card.getSortOrder(),
                formatDateTime(card.getCreatedAt()),
                formatDateTime(card.getUpdatedAt())
        );
    }

    private static String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? "" : dateTime.toString();
    }
}
