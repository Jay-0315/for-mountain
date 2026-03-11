package com.mountain.for_mountain.domain.partner.dto;

import com.mountain.for_mountain.domain.partner.model.entity.PartnerCard;
import lombok.AllArgsConstructor;
import lombok.Getter;

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
                card.getCreatedAt().toString(),
                card.getUpdatedAt().toString()
        );
    }
}
