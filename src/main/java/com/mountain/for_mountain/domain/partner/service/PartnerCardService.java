package com.mountain.for_mountain.domain.partner.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.partner.dto.PartnerCardOrderRequest;
import com.mountain.for_mountain.domain.partner.dto.PartnerCardRequest;
import com.mountain.for_mountain.domain.partner.dto.PartnerCardResponse;
import com.mountain.for_mountain.domain.partner.model.entity.PartnerCard;
import com.mountain.for_mountain.domain.partner.repository.PartnerCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PartnerCardService {

    private final PartnerCardRepository partnerCardRepository;

    public List<PartnerCardResponse> getList() {
        return partnerCardRepository.findAllByOrderBySortOrderAscCreatedAtAsc().stream()
                .map(PartnerCardResponse::new)
                .toList();
    }

    @Transactional
    public PartnerCardResponse create(PartnerCardRequest request) {
        PartnerCard card = PartnerCard.create(
                request.getImageSrc().trim(),
                normalizeLink(request.getLinkUrl()),
                partnerCardRepository.findAllByOrderBySortOrderAscCreatedAtAsc().size()
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
        normalizeSortOrder();
    }

    @Transactional
    public List<PartnerCardResponse> reorder(PartnerCardOrderRequest request) {
        List<PartnerCard> cards = partnerCardRepository.findAllByOrderBySortOrderAscCreatedAtAsc();
        validateOrderedIds(cards, request.getOrderedIds());

        for (int index = 0; index < request.getOrderedIds().size(); index++) {
            final int sortOrder = index;
            Long id = request.getOrderedIds().get(index);
            cards.stream()
                    .filter(card -> card.getId().equals(id))
                    .findFirst()
                    .ifPresent(card -> card.updateSortOrder(sortOrder));
        }

        return partnerCardRepository.findAllByOrderBySortOrderAscCreatedAtAsc().stream()
                .map(PartnerCardResponse::new)
                .toList();
    }

    private String normalizeLink(String linkUrl) {
        return linkUrl == null ? "" : linkUrl.trim();
    }

    private void normalizeSortOrder() {
        List<PartnerCard> cards = partnerCardRepository.findAllByOrderBySortOrderAscCreatedAtAsc();
        for (int index = 0; index < cards.size(); index++) {
            cards.get(index).updateSortOrder(index);
        }
    }

    private void validateOrderedIds(List<PartnerCard> cards, List<Long> orderedIds) {
        if (cards.size() != orderedIds.size()) {
            throw new CustomException(ErrorCode.PARTNER_CARD_NOT_FOUND);
        }
        Set<Long> existingIds = cards.stream().map(PartnerCard::getId).collect(java.util.stream.Collectors.toSet());
        Set<Long> requestedIds = new HashSet<>(orderedIds);
        if (existingIds.size() != requestedIds.size() || !existingIds.equals(requestedIds)) {
            throw new CustomException(ErrorCode.PARTNER_CARD_NOT_FOUND);
        }
    }
}
