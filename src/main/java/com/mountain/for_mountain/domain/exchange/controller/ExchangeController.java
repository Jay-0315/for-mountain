package com.mountain.for_mountain.domain.exchange.controller;

import com.mountain.for_mountain.domain.exchange.dto.CurrencyConversionResponse;
import com.mountain.for_mountain.domain.exchange.service.ExchangeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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

    @GetMapping("/convert")
    @Operation(
            summary = "Convert Currency", 
            description = "Convert an amount from one currency to another. If 'to' parameter is not provided, converts to all available currencies."
    )
    public ResponseEntity<CurrencyConversionResponse> convertCurrency(
            @Parameter(description = "Base currency code (e.g., KRW, USD, EUR)", example = "KRW", required = false)
            @RequestParam(defaultValue = "KRW") String base,
            
            @Parameter(description = "Target currency code to convert to. If not provided, converts to all available currencies", example = "USD", required = false)
            @RequestParam(required = false) String to,
            
            @Parameter(description = "Amount to convert", example = "1000.0", required = true)
            @RequestParam double amount
    ) {
        CurrencyConversionResponse response = exchangeService.convertCurrency(base, to, amount);

        return ResponseEntity.ok(response);
    }
}
