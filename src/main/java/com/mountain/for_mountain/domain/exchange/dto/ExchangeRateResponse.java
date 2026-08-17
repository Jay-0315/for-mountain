package com.mountain.for_mountain.domain.exchange.dto;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Map;

/**
 * Redis 캐시(@Cacheable("exchange_rates"))에 저장되므로 Serializable 이어야 한다.
 * 기본 RedisCacheManager 가 JDK 직렬화를 사용하기 때문에,
 * 이게 없으면 캐시 기록 시점에 SerializationFailedException 이 난다.
 */
public record ExchangeRateResponse(
        double amount,              // Base Amount
        String base,                // Base Currency
        LocalDate date,             // Base Date
        Map<String, Double> rates   // Exchange Rate
) implements Serializable {
}