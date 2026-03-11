package com.mountain.for_mountain.domain.partner.repository;

import com.mountain.for_mountain.domain.partner.model.entity.PartnerCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PartnerCardRepository extends JpaRepository<PartnerCard, Long> {
    List<PartnerCard> findAllByOrderBySortOrderAscCreatedAtAsc();
}
