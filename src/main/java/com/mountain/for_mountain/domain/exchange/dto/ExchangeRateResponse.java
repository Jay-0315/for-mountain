package com.mountain.for_mountain.domain.exchange.dto;

import java.time.LocalDate;
import java.util.Map;

public record ExchangeRateResponse(
        double amount,              // Base Amount
        String base,                // Base Currency
        LocalDate date,             // Base Date
        Map<String, Double> rates   // Exchange Rate
) {
}