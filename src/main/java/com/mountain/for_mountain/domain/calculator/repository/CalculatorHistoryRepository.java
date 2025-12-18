package com.mountain.for_mountain.domain.calculator.repository;

import com.mountain.for_mountain.domain.calculator.model.entity.CalculatorHistory;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface CalculatorHistoryRepository extends JpaRepository<CalculatorHistory, Long>{

};