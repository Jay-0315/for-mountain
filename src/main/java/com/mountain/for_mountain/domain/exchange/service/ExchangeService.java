package com.mountain.for_mountain.domain.exchange.service;

import com.mountain.for_mountain.domain.exchange.dto.ExchangeRateResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Service
public class ExchangeService {

    private final RestClient restClient = RestClient.create();
    private static final String API_URL = "https://api.frankfurter.app/latest";

    public ExchangeRateResponse getExchangeRates(String baseCurrency) {

        URI uri = UriComponentsBuilder.fromHttpUrl(API_URL)
                .queryParam("from", baseCurrency)
                .build()
                .toUri();

        return restClient.get()
                .uri(uri)
                .retrieve()
                .body(ExchangeRateResponse.class);
    }
}
