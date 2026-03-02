package com.mountain.for_mountain.domain.exchange.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.exchange.dto.CurrencyConversionResponse;
import com.mountain.for_mountain.domain.exchange.dto.ExchangeRateResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class ExchangeService {

    private final RestClient restClient = RestClient.create();
    private static final String API_URL = "https://api.frankfurter.app/latest";

     @Cacheable(value = "exchange_rates", key = "#baseCurrency", unless = "#result == null")
    public ExchangeRateResponse getExchangeRates(String baseCurrency) {

         log.info("Cache Miss Call API BaseCurrency: {}", baseCurrency);

        URI uri = UriComponentsBuilder.fromHttpUrl(API_URL)
                .queryParam("from", baseCurrency)
                .build()
                .toUri();

        return restClient.get()
                .uri(uri)
                .retrieve()
                .body(ExchangeRateResponse.class);
    }


    public CurrencyConversionResponse convertCurrency(String from, String to, double amount) {

        ExchangeRateResponse ratesResponse = getExchangeRates(from);

        if (ratesResponse == null || ratesResponse.rates() == null) {
            throw new CustomException(ErrorCode.EXCHANGE_RATE_FETCH_FAILED);
        }

        Map<String, Double> originalRates = ratesResponse.rates();
        Map<String, Double> calculatedResults = new HashMap<>();

        if (to != null && !to.isBlank()) {

            if (!originalRates.containsKey(to)) {

                throw new CustomException(ErrorCode.INVALID_CURRENCY);
            }
            Double rate = originalRates.get(to);
            calculatedResults.put(to, amount * rate);
        } else {

            originalRates.forEach((currency, rate) -> {
                calculatedResults.put(currency, amount * rate);
            });
        }

        return CurrencyConversionResponse.builder()
                .baseCurrency(from)
                .inputAmount(amount)
                .results(calculatedResults)
                .build();
    }
}