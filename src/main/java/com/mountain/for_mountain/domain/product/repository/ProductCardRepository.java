package com.mountain.for_mountain.domain.product.repository;

import com.mountain.for_mountain.domain.product.model.entity.ProductCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductCardRepository extends JpaRepository<ProductCard, Long> {
    List<ProductCard> findAllByOrderBySortOrderAscCreatedAtAsc();
}
