package com.mountain.for_mountain.domain.product.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_cards")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String label;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false, length = 120)
    private String metric;

    @Column(nullable = false, length = 40)
    private String accent;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String icon;

    @Column(nullable = false)
    private Integer sortOrder;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public static ProductCard create(
            String label,
            String title,
            String description,
            String metric,
            String accent,
            String icon,
            Integer sortOrder
    ) {
        ProductCard card = new ProductCard();
        card.label = label;
        card.title = title;
        card.description = description;
        card.metric = metric;
        card.accent = accent;
        card.icon = icon;
        card.sortOrder = sortOrder;
        card.createdAt = LocalDateTime.now();
        card.updatedAt = LocalDateTime.now();
        return card;
    }

    public void update(
            String label,
            String title,
            String description,
            String metric,
            String accent,
            String icon
    ) {
        this.label = label;
        this.title = title;
        this.description = description;
        this.metric = metric;
        this.accent = accent;
        this.icon = icon;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
        this.updatedAt = LocalDateTime.now();
    }
}
