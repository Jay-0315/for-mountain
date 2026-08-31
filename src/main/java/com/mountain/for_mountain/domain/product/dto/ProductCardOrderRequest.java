package com.mountain.for_mountain.domain.product.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ProductCardOrderRequest {

    @NotEmpty
    private List<Long> orderedIds;
}
