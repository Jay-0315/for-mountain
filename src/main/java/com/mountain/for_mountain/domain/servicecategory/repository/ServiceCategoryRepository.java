package com.mountain.for_mountain.domain.servicecategory.repository;

import com.mountain.for_mountain.domain.servicecategory.model.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {
    List<ServiceCategory> findAllByOrderBySortOrderAscCreatedAtAsc();
    Optional<ServiceCategory> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
