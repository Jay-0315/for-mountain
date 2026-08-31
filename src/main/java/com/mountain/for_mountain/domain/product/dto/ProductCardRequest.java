package com.mountain.for_mountain.domain.product.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProductCardRequest {

    @NotBlank
    private String label;

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String metric;

    @NotBlank
    private String accent;

    @NotBlank
    private String icon;
}
