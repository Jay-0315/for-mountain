package com.mountain.for_mountain.domain.partner.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PartnerCardRequest {

    @NotBlank
    private String imageSrc;

    private String linkUrl;
}
