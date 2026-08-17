package com.mountain.for_mountain.domain.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * 로그인 시도 횟수 제한(브루트포스 방어).
 *
 * <p>Redis 에 사번별 실패 횟수를 기록하고, 창(window) 안에서 상한을 넘으면 잠근다.
 * Redis 장애 시에는 로그인을 막지 않고 통과시킨다 —
 * 레이트리밋 실패가 전사 로그인 불가로 번지지 않게 하기 위함이다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private static final String KEY_PREFIX = "login:attempts:";

    private final StringRedisTemplate redisTemplate;

    @Value("${app.auth.login-max-attempts:5}")
    private int maxAttempts;

    @Value("${app.auth.login-lock-minutes:15}")
    private long lockMinutes;

    public boolean isBlocked(String username) {
        String key = keyFor(username);
        if (key == null) {
            return false;
        }
        try {
            String value = redisTemplate.opsForValue().get(key);
            return value != null && Integer.parseInt(value) >= maxAttempts;
        } catch (Exception e) {
            log.warn("Login attempt lookup failed; allowing the request. cause={}", e.toString());
            return false;
        }
    }

    public void recordFailure(String username) {
        String key = keyFor(username);
        if (key == null) {
            return;
        }
        try {
            Long attempts = redisTemplate.opsForValue().increment(key);
            // 첫 실패에만 TTL 을 건다. 이후 실패로 잠금 시간이 갱신되지 않도록.
            if (attempts != null && attempts == 1L) {
                redisTemplate.expire(key, Duration.ofMinutes(lockMinutes));
            }
        } catch (Exception e) {
            log.warn("Could not record a failed login for '{}'. cause={}", username, e.toString());
        }
    }

    public void reset(String username) {
        String key = keyFor(username);
        if (key == null) {
            return;
        }
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.warn("Could not reset login attempts for '{}'. cause={}", username, e.toString());
        }
    }

    private String keyFor(String username) {
        if (username == null || username.isBlank()) {
            return null;
        }
        return KEY_PREFIX + username.trim();
    }
}
