package com.mountain.for_mountain.domain.exchange.controller;

import com.mountain.for_mountain.domain.exchange.dto.ExchangeRateResponse;
import com.mountain.for_mountain.domain.exchange.service.ExchangeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/exchange")
@Tag(name = "Exchange API", description = "Real-time Exchange Rate API")
public class ExchangeController {

    private final ExchangeService exchangeService;

    @GetMapping
    @Operation(summary = "Get Exchange Rates", description = "Get exchange rates for all currencies")
    public ResponseEntity<ExchangeRateResponse> getExchangeRates(
            @RequestParam(defaultValue = "KRW") String base
    ) {
        ExchangeRateResponse response = exchangeService.getExchangeRates(base);
        return ResponseEntity.ok(response);
    }
}
