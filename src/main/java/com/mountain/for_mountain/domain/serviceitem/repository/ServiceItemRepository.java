package com.mountain.for_mountain.domain.serviceitem.repository;

import com.mountain.for_mountain.domain.serviceitem.model.entity.ServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {
    List<ServiceItem> findAllByOrderBySortOrderAscCreatedAtAsc();
    List<ServiceItem> findByCategoryOrderBySortOrderAscCreatedAtAsc(String category);
    boolean existsByCategory(String category);
}
