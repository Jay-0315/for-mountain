package com.mountain.for_mountain.domain.partner.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.partner.dto.PartnerCardRequest;
import com.mountain.for_mountain.domain.partner.dto.PartnerCardResponse;
import com.mountain.for_mountain.domain.partner.model.entity.PartnerCard;
import com.mountain.for_mountain.domain.partner.repository.PartnerCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PartnerCardService {

    private final PartnerCardRepository partnerCardRepository;

    public List<PartnerCardResponse> getList() {
        return partnerCardRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(PartnerCardResponse::new)
                .toList();
    }

    @Transactional
    public PartnerCardResponse create(PartnerCardRequest request) {
        PartnerCard card = PartnerCard.create(
                request.getImageSrc().trim(),
                normalizeLink(request.getLinkUrl())
        );
        return new PartnerCardResponse(partnerCardRepository.save(card));
    }

    @Transactional
    public PartnerCardResponse update(Long id, PartnerCardRequest request) {
        PartnerCard card = partnerCardRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PARTNER_CARD_NOT_FOUND));
        card.update(
                request.getImageSrc().trim(),
                normalizeLink(request.getLinkUrl())
        );
        return new PartnerCardResponse(card);
    }

    @Transactional
    public void delete(Long id) {
        PartnerCard card = partnerCardRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PARTNER_CARD_NOT_FOUND));
        partnerCardRepository.delete(card);
    }

    private String normalizeLink(String linkUrl) {
        return linkUrl == null ? "" : linkUrl.trim();
    }
}
