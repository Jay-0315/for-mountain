package com.mountain.for_mountain.domain.product.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.product.dto.ProductCardOrderRequest;
import com.mountain.for_mountain.domain.product.dto.ProductCardRequest;
import com.mountain.for_mountain.domain.product.dto.ProductCardResponse;
import com.mountain.for_mountain.domain.product.model.entity.ProductCard;
import com.mountain.for_mountain.domain.product.repository.ProductCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductCardService {

    private static final List<DefaultProductCard> DEFAULT_CARDS = List.of(
            new DefaultProductCard(
                    "AI Assistant",
                    "AI 業務アシスタント",
                    "社内ナレッジと定型業務を支援する業務AI。",
                    "ChatOps",
                    "orange",
                    "M9.75 3.75h4.5m-7.5 3h10.5a2 2 0 012 2v8.5a2 2 0 01-2 2H6.75a2 2 0 01-2-2v-8.5a2 2 0 012-2zm3 5h.01m4.49 0h.01M9 15.25c1.9 1.3 4.1 1.3 6 0"
            ),
            new DefaultProductCard(
                    "AI OCR",
                    "AI-OCR データ化",
                    "紙書類や帳票を読み取り、扱いやすいデータへ変換。",
                    "Scan Flow",
                    "yellow",
                    "M7 4.75h10M7 19.25h10M6.25 7.5v9a2 2 0 002 2h7.5a2 2 0 002-2v-9a2 2 0 00-2-2h-7.5a2 2 0 00-2 2zm3 2h5.5m-5.5 3h5.5m-5.5 3h3"
            ),
            new DefaultProductCard(
                    "Knowledge AI",
                    "AI ナレッジ検索",
                    "規程、FAQ、マニュアルから必要な情報を素早く検索。",
                    "Search Hub",
                    "green",
                    "M10.75 18.25a7.5 7.5 0 100-15 7.5 7.5 0 000 15zm5.3-2.2l4.2 4.2M8.5 9.75h4.5m-4.5 3h3"
            ),
            new DefaultProductCard(
                    "AI Security",
                    "AI セキュリティ支援",
                    "業務環境のリスクを可視化し、運用改善を支援。",
                    "Risk Guard",
                    "red",
                    "M12 3.75l6.25 2.25v4.75c0 4.05-2.45 7.7-6.25 9.5-3.8-1.8-6.25-5.45-6.25-9.5V6L12 3.75zm-2 8.25l1.4 1.4L15 9.8"
            )
    );

    private final ProductCardRepository productCardRepository;

    @Transactional
    public List<ProductCardResponse> getList() {
        seedDefaultsIfEmpty();
        return productCardRepository.findAllByOrderBySortOrderAscCreatedAtAsc().stream()
                .map(ProductCardResponse::new)
                .toList();
    }

    @Transactional
    public ProductCardResponse create(ProductCardRequest request) {
        ProductCard card = ProductCard.create(
                normalize(request.getLabel()),
                normalize(request.getTitle()),
                normalize(request.getDescription()),
                normalize(request.getMetric()),
                normalizeAccent(request.getAccent()),
                normalize(request.getIcon()),
                productCardRepository.findAllByOrderBySortOrderAscCreatedAtAsc().size()
        );
        return new ProductCardResponse(productCardRepository.save(card));
    }

    @Transactional
    public ProductCardResponse update(Long id, ProductCardRequest request) {
        ProductCard card = productCardRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_CARD_NOT_FOUND));
        card.update(
                normalize(request.getLabel()),
                normalize(request.getTitle()),
                normalize(request.getDescription()),
                normalize(request.getMetric()),
                normalizeAccent(request.getAccent()),
                normalize(request.getIcon())
        );
        return new ProductCardResponse(card);
    }

    @Transactional
    public void delete(Long id) {
        ProductCard card = productCardRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_CARD_NOT_FOUND));
        productCardRepository.delete(card);
        normalizeSortOrder();
    }

    @Transactional
    public List<ProductCardResponse> reorder(ProductCardOrderRequest request) {
        List<ProductCard> cards = productCardRepository.findAllByOrderBySortOrderAscCreatedAtAsc();
        validateOrderedIds(cards, request.getOrderedIds());

        for (int index = 0; index < request.getOrderedIds().size(); index++) {
            final int sortOrder = index;
            Long id = request.getOrderedIds().get(index);
            cards.stream()
                    .filter(card -> card.getId().equals(id))
                    .findFirst()
                    .ifPresent(card -> card.updateSortOrder(sortOrder));
        }

        return productCardRepository.findAllByOrderBySortOrderAscCreatedAtAsc().stream()
                .map(ProductCardResponse::new)
                .toList();
    }

    @Transactional
    protected void seedDefaultsIfEmpty() {
        if (productCardRepository.count() > 0) {
            return;
        }
        for (int index = 0; index < DEFAULT_CARDS.size(); index++) {
            DefaultProductCard defaultCard = DEFAULT_CARDS.get(index);
            productCardRepository.save(ProductCard.create(
                    defaultCard.label(),
                    defaultCard.title(),
                    defaultCard.description(),
                    defaultCard.metric(),
                    defaultCard.accent(),
                    defaultCard.icon(),
                    index
            ));
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeAccent(String accent) {
        String normalized = normalize(accent).toLowerCase();
        return switch (normalized) {
            case "yellow", "green", "red" -> normalized;
            default -> "orange";
        };
    }

    private void normalizeSortOrder() {
        List<ProductCard> cards = productCardRepository.findAllByOrderBySortOrderAscCreatedAtAsc();
        for (int index = 0; index < cards.size(); index++) {
            cards.get(index).updateSortOrder(index);
        }
    }

    private void validateOrderedIds(List<ProductCard> cards, List<Long> orderedIds) {
        if (cards.size() != orderedIds.size()) {
            throw new CustomException(ErrorCode.PRODUCT_CARD_NOT_FOUND);
        }
        Set<Long> existingIds = cards.stream().map(ProductCard::getId).collect(java.util.stream.Collectors.toSet());
        Set<Long> requestedIds = new HashSet<>(orderedIds);
        if (existingIds.size() != requestedIds.size() || !existingIds.equals(requestedIds)) {
            throw new CustomException(ErrorCode.PRODUCT_CARD_NOT_FOUND);
        }
    }

    private record DefaultProductCard(
            String label,
            String title,
            String description,
            String metric,
            String accent,
            String icon
    ) {
    }
}
