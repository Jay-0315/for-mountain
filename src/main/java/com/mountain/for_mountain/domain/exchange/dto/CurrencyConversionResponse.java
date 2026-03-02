package com.mountain.for_mountain.domain.exchange.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import java.util.Map;

@Getter
@Builder
@Schema(description = "Currency conversion response containing converted amounts")
public class CurrencyConversionResponse {
    
    @Schema(description = "Base currency code used for conversion", example = "KRW")
    private String baseCurrency;
    
    @Schema(description = "Input amount that was converted", example = "1000.0")
    private double inputAmount;
    
    @Schema(description = "Map of currency codes to converted amounts", example = "{\"USD\": 0.75, \"EUR\": 0.69}")
    private Map<String, Double> results;
}