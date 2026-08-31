package com.mountain.for_mountain.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Configuration;

/**
 * 캐시는 모든 프로파일에서 활성화한다.
 * 예전에는 @Profile("dev") 가 붙어 있어 운영에서 @Cacheable 이 조용히 무시됐고,
 * 환율 조회가 매 요청마다 외부 API 를 호출했다.
 *
 * <p>캐시 백엔드는 Redis 다. Redis 장애가 API 장애로 번지지 않도록
 * 캐시 오류는 로그만 남기고 무시한다(캐시 미스처럼 동작 → 원본 호출).
 */
@Slf4j
@Configuration
@EnableCaching
public class CacheConfig implements CachingConfigurer {

    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException e, Cache cache, Object key) {
                log.warn("Cache GET failed (cache={}, key={}); falling through to the source. cause={}",
                        cache.getName(), key, e.toString());
            }

            @Override
            public void handleCachePutError(RuntimeException e, Cache cache, Object key, Object value) {
                log.warn("Cache PUT failed (cache={}, key={}); the value is simply not cached. cause={}",
                        cache.getName(), key, e.toString());
            }

            @Override
            public void handleCacheEvictError(RuntimeException e, Cache cache, Object key) {
                log.warn("Cache EVICT failed (cache={}, key={}). cause={}",
                        cache.getName(), key, e.toString());
            }

            @Override
            public void handleCacheClearError(RuntimeException e, Cache cache) {
                log.warn("Cache CLEAR failed (cache={}). cause={}", cache.getName(), e.toString());
            }
        };
    }
}
