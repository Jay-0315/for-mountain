package com.mountain.for_mountain.domain.partner.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "partner_cards")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PartnerCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String imageSrc;

    @Column(nullable = false, length = 1000)
    private String linkUrl;

    @Column(nullable = false)
    private Integer sortOrder;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public static PartnerCard create(String imageSrc, String linkUrl, Integer sortOrder) {
        PartnerCard card = new PartnerCard();
        card.imageSrc = imageSrc;
        card.linkUrl = linkUrl;
        card.sortOrder = sortOrder;
        card.createdAt = LocalDateTime.now();
        card.updatedAt = LocalDateTime.now();
        return card;
    }

    public void update(String imageSrc, String linkUrl) {
        this.imageSrc = imageSrc;
        this.linkUrl = linkUrl;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
        this.updatedAt = LocalDateTime.now();
    }
}
