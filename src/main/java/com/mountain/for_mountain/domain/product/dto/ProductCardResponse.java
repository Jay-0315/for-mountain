package com.mountain.for_mountain.domain.product.dto;

import com.mountain.for_mountain.domain.product.model.entity.ProductCard;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ProductCardResponse {
    private Long id;
    private String label;
    private String title;
    private String description;
    private String metric;
    private String accent;
    private String icon;
    private Integer sortOrder;
    private String createdAt;
    private String updatedAt;

    public ProductCardResponse(ProductCard card) {
        this(
                card.getId(),
                card.getLabel(),
                card.getTitle(),
                card.getDescription(),
                card.getMetric(),
                card.getAccent(),
                card.getIcon(),
                card.getSortOrder(),
                formatDateTime(card.getCreatedAt()),
                formatDateTime(card.getUpdatedAt())
        );
    }

    private static String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? "" : dateTime.toString();
    }
}
