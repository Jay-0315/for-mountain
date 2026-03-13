package com.mountain.for_mountain.domain.serviceitem.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.servicecategory.service.ServiceCategoryService;
import com.mountain.for_mountain.domain.serviceitem.dto.MediaAssetDto;
import com.mountain.for_mountain.domain.serviceitem.dto.ServiceItemOrderRequest;
import com.mountain.for_mountain.domain.serviceitem.dto.ServiceItemRequest;
import com.mountain.for_mountain.domain.serviceitem.dto.ServiceItemResponse;
import com.mountain.for_mountain.domain.serviceitem.model.entity.ServiceItem;
import com.mountain.for_mountain.domain.serviceitem.repository.ServiceItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ServiceItemService {

    private final ServiceItemRepository serviceItemRepository;
    private final ServiceCategoryService serviceCategoryService;
    private final ObjectMapper objectMapper;

    public List<ServiceItemResponse> getList(String category) {
        List<ServiceItem> items = (category == null || category.isBlank())
                ? serviceItemRepository.findAllByOrderBySortOrderAscCreatedAtAsc()
                : serviceItemRepository.findByCategoryOrderBySortOrderAscCreatedAtAsc(category.trim());

        return items.stream()
                .map(this::toResponse)
                .toList();
    }

    public ServiceItemResponse getDetail(Long id) {
        ServiceItem item = serviceItemRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.SERVICE_ITEM_NOT_FOUND));
        return toResponse(item);
    }

    @Transactional
    public ServiceItemResponse create(ServiceItemRequest request) {
        String category = request.getCategory().trim();
        serviceCategoryService.getBySlugOrThrow(category);

        List<MediaAssetDto> videoAssets = normalizeAssets(request.getVideoAssets(), request.getVideoName(), request.getVideoData());
        List<MediaAssetDto> imageAssets = normalizeAssets(request.getImageAssets(), request.getImageName(), request.getImageData());
        List<MediaAssetDto> attachmentAssets = normalizeAssets(request.getAttachmentAssets(), request.getAttachmentName(), request.getAttachmentData());

        ServiceItem item = ServiceItem.create(
                category,
                request.getTitle().trim(),
                request.getContent().trim(),
                firstAssetName(videoAssets),
                firstAssetUrl(videoAssets),
                writeAssets(videoAssets),
                normalizeNullable(request.getLinkUrl()),
                firstAssetName(imageAssets),
                firstAssetUrl(imageAssets),
                writeAssets(imageAssets),
                firstAssetName(attachmentAssets),
                firstAssetUrl(attachmentAssets),
                writeAssets(attachmentAssets),
                serviceItemRepository.findAllByOrderBySortOrderAscCreatedAtAsc().size()
        );
        return toResponse(serviceItemRepository.save(item));
    }

    @Transactional
    public ServiceItemResponse update(Long id, ServiceItemRequest request) {
        ServiceItem item = serviceItemRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.SERVICE_ITEM_NOT_FOUND));
        String category = request.getCategory().trim();
        serviceCategoryService.getBySlugOrThrow(category);
        List<MediaAssetDto> videoAssets = normalizeAssets(request.getVideoAssets(), request.getVideoName(), request.getVideoData());
        List<MediaAssetDto> imageAssets = normalizeAssets(request.getImageAssets(), request.getImageName(), request.getImageData());
        List<MediaAssetDto> attachmentAssets = normalizeAssets(request.getAttachmentAssets(), request.getAttachmentName(), request.getAttachmentData());
        item.update(
                category,
                request.getTitle().trim(),
                request.getContent().trim(),
                firstAssetName(videoAssets),
                firstAssetUrl(videoAssets),
                writeAssets(videoAssets),
                normalizeNullable(request.getLinkUrl()),
                firstAssetName(imageAssets),
                firstAssetUrl(imageAssets),
                writeAssets(imageAssets),
                firstAssetName(attachmentAssets),
                firstAssetUrl(attachmentAssets),
                writeAssets(attachmentAssets)
        );
        return toResponse(item);
    }

    @Transactional
    public void delete(Long id) {
        ServiceItem item = serviceItemRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.SERVICE_ITEM_NOT_FOUND));
        serviceItemRepository.delete(item);
        normalizeSortOrder();
    }

    @Transactional
    public List<ServiceItemResponse> reorder(ServiceItemOrderRequest request) {
        List<ServiceItem> items = serviceItemRepository.findAllByOrderBySortOrderAscCreatedAtAsc();
        validateOrderedIds(items, request.getOrderedIds());

        for (int index = 0; index < request.getOrderedIds().size(); index++) {
            final int sortOrder = index;
            Long id = request.getOrderedIds().get(index);
            items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst()
                    .ifPresent(item -> item.updateSortOrder(sortOrder));
        }

        return serviceItemRepository.findAllByOrderBySortOrderAscCreatedAtAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    private ServiceItemResponse toResponse(ServiceItem item) {
        List<MediaAssetDto> videoAssets = readAssets(item.getVideoAssetsJson(), item.getVideoName(), item.getVideoData());
        List<MediaAssetDto> imageAssets = readAssets(item.getImageAssetsJson(), item.getImageName(), item.getImageData());
        List<MediaAssetDto> attachmentAssets = readAssets(item.getAttachmentAssetsJson(), item.getAttachmentName(), item.getAttachmentData());

        return new ServiceItemResponse(
                item.getId(),
                item.getCategory(),
                item.getTitle(),
                item.getContent(),
                item.getVideoName(),
                item.getVideoData(),
                videoAssets,
                item.getLinkUrl(),
                item.getImageName(),
                item.getImageData(),
                imageAssets,
                item.getAttachmentName(),
                item.getAttachmentData(),
                attachmentAssets,
                item.getSortOrder(),
                item.getCreatedAt().toString(),
                item.getUpdatedAt().toString()
        );
    }

    private List<MediaAssetDto> normalizeAssets(List<MediaAssetDto> assets, String legacyName, String legacyUrl) {
        List<MediaAssetDto> normalized = (assets == null ? List.<MediaAssetDto>of() : assets).stream()
                .filter(asset -> asset != null && normalizeNullable(asset.getUrl()) != null)
                .map(asset -> new MediaAssetDto(
                        normalizeNullable(asset.getName()),
                        normalizeNullable(asset.getUrl())
                ))
                .toList();

        if (!normalized.isEmpty()) {
            return normalized;
        }

        String url = normalizeNullable(legacyUrl);
        if (url == null) {
            return List.of();
        }
        return List.of(new MediaAssetDto(normalizeNullable(legacyName), url));
    }

    private List<MediaAssetDto> readAssets(String json, String legacyName, String legacyUrl) {
        if (json != null && !json.isBlank()) {
            try {
                return objectMapper.readValue(json, new TypeReference<List<MediaAssetDto>>() {});
            } catch (JsonProcessingException ignored) {
            }
        }
        return normalizeAssets(null, legacyName, legacyUrl);
    }

    private String writeAssets(List<MediaAssetDto> assets) {
        if (assets == null || assets.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(assets);
        } catch (JsonProcessingException e) {
            throw new CustomException(ErrorCode.INVALID_UPLOAD_REQUEST);
        }
    }

    private String firstAssetName(List<MediaAssetDto> assets) {
        return assets.isEmpty() ? null : normalizeNullable(assets.get(0).getName());
    }

    private String firstAssetUrl(List<MediaAssetDto> assets) {
        return assets.isEmpty() ? null : normalizeNullable(assets.get(0).getUrl());
    }

    private String normalizeNullable(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void normalizeSortOrder() {
        List<ServiceItem> items = serviceItemRepository.findAllByOrderBySortOrderAscCreatedAtAsc();
        for (int index = 0; index < items.size(); index++) {
            items.get(index).updateSortOrder(index);
        }
    }

    private void validateOrderedIds(List<ServiceItem> items, List<Long> orderedIds) {
        if (items.size() != orderedIds.size()) {
            throw new CustomException(ErrorCode.SERVICE_ITEM_NOT_FOUND);
        }
        Set<Long> existingIds = items.stream().map(ServiceItem::getId).collect(java.util.stream.Collectors.toSet());
        Set<Long> requestedIds = new HashSet<>(orderedIds);
        if (existingIds.size() != requestedIds.size() || !existingIds.equals(requestedIds)) {
            throw new CustomException(ErrorCode.SERVICE_ITEM_NOT_FOUND);
        }
    }
}
