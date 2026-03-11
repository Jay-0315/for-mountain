package com.mountain.for_mountain.domain.serviceitem.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.servicecategory.service.ServiceCategoryService;
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

    public List<ServiceItemResponse> getList(String category) {
        List<ServiceItem> items = (category == null || category.isBlank())
                ? serviceItemRepository.findAllByOrderBySortOrderAscCreatedAtAsc()
                : serviceItemRepository.findByCategoryOrderBySortOrderAscCreatedAtAsc(category.trim());

        return items.stream()
                .map(ServiceItemResponse::new)
                .toList();
    }

    public ServiceItemResponse getDetail(Long id) {
        ServiceItem item = serviceItemRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.SERVICE_ITEM_NOT_FOUND));
        return new ServiceItemResponse(item);
    }

    @Transactional
    public ServiceItemResponse create(ServiceItemRequest request) {
        String category = request.getCategory().trim();
        serviceCategoryService.getBySlugOrThrow(category);

        ServiceItem item = ServiceItem.create(
                category,
                request.getTitle().trim(),
                request.getContent().trim(),
                normalizeNullable(request.getVideoName()),
                normalizeNullable(request.getVideoData()),
                normalizeNullable(request.getLinkUrl()),
                normalizeNullable(request.getImageName()),
                normalizeNullable(request.getImageData()),
                normalizeNullable(request.getAttachmentName()),
                normalizeNullable(request.getAttachmentData()),
                serviceItemRepository.findAllByOrderBySortOrderAscCreatedAtAsc().size()
        );
        return new ServiceItemResponse(serviceItemRepository.save(item));
    }

    @Transactional
    public ServiceItemResponse update(Long id, ServiceItemRequest request) {
        ServiceItem item = serviceItemRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.SERVICE_ITEM_NOT_FOUND));
        String category = request.getCategory().trim();
        serviceCategoryService.getBySlugOrThrow(category);
        item.update(
                category,
                request.getTitle().trim(),
                request.getContent().trim(),
                normalizeNullable(request.getVideoName()),
                normalizeNullable(request.getVideoData()),
                normalizeNullable(request.getLinkUrl()),
                normalizeNullable(request.getImageName()),
                normalizeNullable(request.getImageData()),
                normalizeNullable(request.getAttachmentName()),
                normalizeNullable(request.getAttachmentData())
        );
        return new ServiceItemResponse(item);
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
                .map(ServiceItemResponse::new)
                .toList();
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
