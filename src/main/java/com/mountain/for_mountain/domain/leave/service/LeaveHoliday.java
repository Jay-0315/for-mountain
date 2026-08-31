package com.mountain.for_mountain.domain.leave.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class LeaveHoliday {

    private static final String CALENDAR_ID = "ja.japanese#holiday@group.v.calendar.google.com";
    private static final Duration CACHE_TTL = Duration.ofHours(24);

    private final RestClient restClient = RestClient.create("https://www.googleapis.com");
    private final Map<Integer, YearHolidays> cache = new ConcurrentHashMap<>();

    @Value("${google.calendar.api-key:}")
    private String apiKey;

    public Set<LocalDate> getHolidays(LocalDate start, LocalDate end) {
        Set<LocalDate> result = new HashSet<>();
        for (int year = start.getYear(); year <= end.getYear(); year++) {
            result.addAll(getHolidaysForYear(year));
        }
        result.removeIf(date -> date.isBefore(start) || date.isAfter(end));
        return result;
    }

    private Set<LocalDate> getHolidaysForYear(int year) {
        YearHolidays cached = cache.get(year);
        if (cached != null && !cached.isExpired()) {
            return cached.dates();
        }

        try {
            JsonNode response = restClient.get()
                    .uri(builder -> builder.path("/calendar/v3/calendars/{id}/events")
                            .queryParam("key", apiKey)
                            .queryParam("timeMin", year + "-01-01T00:00:00Z")
                            .queryParam("timeMax", (year + 1) + "-01-01T00:00:00Z")
                            .queryParam("fields", "items(start/date)")
                            .build(CALENDAR_ID))
                    .retrieve()
                    .body(JsonNode.class);

            Set<LocalDate> dates = new HashSet<>();
            for (JsonNode item : response.path("items")) {
                String date = item.path("start").path("date").asText(null);
                if (date != null) {
                    dates.add(LocalDate.parse(date));
                }
            }
            cache.put(year, new YearHolidays(dates, Instant.now()));
            return dates;
        } catch (Exception e) {
            log.warn("祝日取得失敗 (year={})。キャッシュまたは空集合で継続します。", year, e);
            return cached != null ? cached.dates() : Set.of();
        }
    }

    private record YearHolidays(Set<LocalDate> dates, Instant fetchedAt) {
        boolean isExpired() {
            return Instant.now().isAfter(fetchedAt.plus(CACHE_TTL));
        }
    }
}
