package com.mountain.for_mountain.domain.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class LoginAttemptServiceTest {

    private static final String USERNAME = "M26031025";
    private static final String KEY = "login:attempts:" + USERNAME;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private LoginAttemptService loginAttemptService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(loginAttemptService, "maxAttempts", 5);
        ReflectionTestUtils.setField(loginAttemptService, "lockMinutes", 15L);
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
    }

    @Test
    @DisplayName("실패 횟수가 상한 미만이면 차단하지 않는다")
    void doesNotBlockBelowTheLimit() {
        given(valueOperations.get(KEY)).willReturn("4");

        assertThat(loginAttemptService.isBlocked(USERNAME)).isFalse();
    }

    @Test
    @DisplayName("실패 횟수가 상한에 도달하면 차단한다")
    void blocksAtTheLimit() {
        given(valueOperations.get(KEY)).willReturn("5");

        assertThat(loginAttemptService.isBlocked(USERNAME)).isTrue();
    }

    @Test
    @DisplayName("기록이 없으면 차단하지 않는다")
    void doesNotBlockWhenThereIsNoRecord() {
        given(valueOperations.get(KEY)).willReturn(null);

        assertThat(loginAttemptService.isBlocked(USERNAME)).isFalse();
    }

    @Test
    @DisplayName("첫 실패에만 TTL 을 건다")
    void setsTheTtlOnlyOnTheFirstFailure() {
        given(valueOperations.increment(KEY)).willReturn(1L);

        loginAttemptService.recordFailure(USERNAME);

        verify(redisTemplate).expire(KEY, Duration.ofMinutes(15));
    }

    @Test
    @DisplayName("두 번째 이후 실패는 TTL 을 갱신하지 않는다")
    void doesNotRefreshTheTtlOnLaterFailures() {
        given(valueOperations.increment(KEY)).willReturn(3L);

        loginAttemptService.recordFailure(USERNAME);

        verify(redisTemplate, never()).expire(eq(KEY), any(Duration.class));
    }

    @Test
    @DisplayName("로그인 성공 시 카운터를 지운다")
    void clearsTheCounterOnSuccess() {
        loginAttemptService.reset(USERNAME);

        verify(redisTemplate).delete(KEY);
    }

    @Test
    @DisplayName("Redis 장애 시에는 로그인을 막지 않는다(fail-open)")
    void failsOpenWhenRedisIsDown() {
        given(valueOperations.get(KEY))
                .willThrow(new RedisConnectionFailureException("redis is down"));

        assertThat(loginAttemptService.isBlocked(USERNAME)).isFalse();
    }

    @Test
    @DisplayName("사번이 비어 있으면 Redis 를 건드리지 않는다")
    void ignoresBlankUsernames() {
        assertThat(loginAttemptService.isBlocked("  ")).isFalse();
        loginAttemptService.recordFailure(null);

        verify(valueOperations, never()).increment(any());
    }
}
