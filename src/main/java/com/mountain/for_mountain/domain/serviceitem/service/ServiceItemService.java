package com.mountain.for_mountain.domain.serviceitem.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.servicecategory.service.ServiceCategoryService;
import com.mountain.for_mountain.domain.serviceitem.dto.ServiceItemRequest;
import com.mountain.for_mountain.domain.serviceitem.dto.ServiceItemResponse;
import com.mountain.for_mountain.domain.serviceitem.model.entity.ServiceItem;
import com.mountain.for_mountain.domain.serviceitem.repository.ServiceItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ServiceItemService {

    private final ServiceItemRepository serviceItemRepository;
    private final ServiceCategoryService serviceCategoryService;

    public List<ServiceItemResponse> getList(String category) {
        List<ServiceItem> items = (category == null || category.isBlank())
                ? serviceItemRepository.findAllByOrderByCreatedAtDesc()
                : serviceItemRepository.findByCategoryOrderByCreatedAtDesc(category.trim());

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
                normalizeNullable(request.getAttachmentData())
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
    }

    private String normalizeNullable(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
