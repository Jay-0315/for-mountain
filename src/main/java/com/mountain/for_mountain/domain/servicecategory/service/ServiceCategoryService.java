package com.mountain.for_mountain.domain.servicecategory.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.servicecategory.dto.ServiceCategoryRequest;
import com.mountain.for_mountain.domain.servicecategory.dto.ServiceCategoryResponse;
import com.mountain.for_mountain.domain.servicecategory.model.entity.ServiceCategory;
import com.mountain.for_mountain.domain.servicecategory.repository.ServiceCategoryRepository;
import com.mountain.for_mountain.domain.serviceitem.repository.ServiceItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ServiceCategoryService {

    private final ServiceCategoryRepository serviceCategoryRepository;
    private final ServiceItemRepository serviceItemRepository;

    public List<ServiceCategoryResponse> getList() {
        return serviceCategoryRepository.findAllByOrderBySortOrderAscCreatedAtAsc()
                .stream()
                .map(ServiceCategoryResponse::new)
                .toList();
    }

    public ServiceCategory getBySlugOrThrow(String slug) {
        return serviceCategoryRepository.findBySlug(slug)
                .orElseThrow(() -> new CustomException(ErrorCode.SERVICE_CATEGORY_NOT_FOUND));
    }

    @Transactional
    public ServiceCategoryResponse create(ServiceCategoryRequest request) {
        String name = request.getName().trim();
        String iconKey = request.getIconKey().trim();
        String slug = createUniqueSlug(name);
        int sortOrder = serviceCategoryRepository.findAllByOrderBySortOrderAscCreatedAtAsc().size();

        ServiceCategory category = ServiceCategory.create(slug, name, iconKey, sortOrder);
        return new ServiceCategoryResponse(serviceCategoryRepository.save(category));
    }

    @Transactional
    public ServiceCategoryResponse update(Long id, ServiceCategoryRequest request) {
        ServiceCategory category = serviceCategoryRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.SERVICE_CATEGORY_NOT_FOUND));
        category.update(request.getName().trim(), request.getIconKey().trim());
        return new ServiceCategoryResponse(category);
    }

    @Transactional
    public void delete(Long id) {
        ServiceCategory category = serviceCategoryRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.SERVICE_CATEGORY_NOT_FOUND));

        if (serviceItemRepository.existsByCategory(category.getSlug())) {
            throw new CustomException(ErrorCode.SERVICE_CATEGORY_IN_USE);
        }

        serviceCategoryRepository.delete(category);
        normalizeSortOrder();
    }

    @Transactional
    public void seedDefaults() {
        seedOrUpdate("solutions", "ソリューション", "grid", 0);
        seedOrUpdate("system", "システム開発", "code", 1);
        seedOrUpdate("consulting", "コンサルティング", "chart", 2);
        seedOrUpdate("network", "ネットワーク", "network", 3);
    }

    private void seedOrUpdate(String slug, String name, String iconKey, int sortOrder) {
        ServiceCategory category = serviceCategoryRepository.findBySlug(slug).orElse(null);
        if (category == null) {
            serviceCategoryRepository.save(ServiceCategory.create(slug, name, iconKey, sortOrder));
            return;
        }

        category.update(name, iconKey);
        category.updateSortOrder(sortOrder);
    }

    private void normalizeSortOrder() {
        List<ServiceCategory> categories = serviceCategoryRepository.findAllByOrderBySortOrderAscCreatedAtAsc();
        for (int i = 0; i < categories.size(); i++) {
            if (!categories.get(i).getSortOrder().equals(i)) {
                categories.get(i).updateSortOrder(i);
            }
        }
    }

    private String createUniqueSlug(String name) {
        String base = slugify(name);
        String slug = base;
        int suffix = 2;

        while (serviceCategoryRepository.existsBySlug(slug)) {
            slug = base + "-" + suffix;
            suffix += 1;
        }

        return slug;
    }

    private String slugify(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFKD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");

        if (!normalized.isBlank()) {
            return normalized;
        }

        return "category";
    }
}
