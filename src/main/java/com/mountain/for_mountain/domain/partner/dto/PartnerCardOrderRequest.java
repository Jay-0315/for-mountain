package com.mountain.for_mountain.domain.partner.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class PartnerCardOrderRequest {

    @NotEmpty
    private List<Long> orderedIds;
}
