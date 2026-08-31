package com.mountain.for_mountain.domain.partner.dto;

import com.mountain.for_mountain.domain.partner.model.entity.PartnerCard;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class PartnerCardResponseTest {

    @Test
    void handlesMissingTimestamps() {
        PartnerCard card = PartnerCard.create("image", "", 0);
        ReflectionTestUtils.setField(card, "createdAt", null);
        ReflectionTestUtils.setField(card, "updatedAt", null);

        PartnerCardResponse response = new PartnerCardResponse(card);

        assertThat(response.getCreatedAt()).isEmpty();
        assertThat(response.getUpdatedAt()).isEmpty();
    }
}
