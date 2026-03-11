package com.mountain.for_mountain.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Component
public class JwtService {

    private final SecretKey key;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long accessExpirationMs,
            @Value("${app.jwt.refresh-expiration-ms:604800000}") long refreshExpirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    // ── Access Token 생성 ────────────────────────────────────────
    public String generateAccessToken(String subject, String role) {
        Date now = new Date();
        return Jwts.builder()
                .subject(subject)
                .claim("role", role)
                .claim("type", "access")
                .issuedAt(now)
                .expiration(new Date(now.getTime() + accessExpirationMs))
                .signWith(key)
                .compact();
    }

    // ── Refresh Token 생성 ───────────────────────────────────────
    public String generateRefreshToken(String subject, String role) {
        Date now = new Date();
        return Jwts.builder()
                .subject(subject)
                .claim("role", role)
                .claim("type", "refresh")
                .claim("tokenId", UUID.randomUUID().toString())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + refreshExpirationMs))
                .signWith(key)
                .compact();
    }

    // ── 검증 ─────────────────────────────────────────────────────
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.debug("Token expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (SecurityException e) {
            log.error("JWT security exception: {}", e.getMessage());
        } catch (JwtException | IllegalArgumentException e) {
            log.error("JWT error: {}", e.getMessage());
        }
        return false;
    }

    // ── 클레임 추출 ───────────────────────────────────────────────
    public String extractSubject(String token) {
        return getClaims(token).getSubject();
    }

    public String extractRole(String token) {
        try {
            return getClaims(token).get("role", String.class);
        } catch (Exception e) {
            log.error("Error extracting role from token: {}", e.getMessage());
            return null;
        }
    }

    public String extractType(String token) {
        try {
            return getClaims(token).get("type", String.class);
        } catch (Exception e) {
            log.error("Error extracting type from token: {}", e.getMessage());
            return null;
        }
    }

    // ── 내부 헬퍼 ────────────────────────────────────────────────
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
