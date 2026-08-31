package com.mountain.for_mountain.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpMethod;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (!(HttpMethod.GET.matches(request.getMethod()) && uri.startsWith("/api/v1/"))) {
            return false;
        }

        String bearer = request.getHeader("Authorization");
        return !StringUtils.hasText(bearer) || !bearer.startsWith("Bearer ");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = extractToken(request);

        if (StringUtils.hasText(token)) {
            if (!jwtService.validateToken(token)) {
                log.debug("Ignoring invalid JWT for request: {} {}", request.getMethod(), request.getRequestURI());
                SecurityContextHolder.clearContext();
                filterChain.doFilter(request, response);
                return;
            }
            // 액세스 토큰만 인증에 사용한다. (리프레시 토큰 등 다른 타입은 거부)
            String type = jwtService.extractType(token);
            if (type != null && !"access".equals(type)) {
                log.debug("Rejecting non-access token type '{}' for request: {} {}",
                        type, request.getMethod(), request.getRequestURI());
                SecurityContextHolder.clearContext();
                filterChain.doFilter(request, response);
                return;
            }

            String subject = jwtService.extractSubject(token);
            String role = jwtService.extractRole(token);
            // role 클레임이 없으면 권한을 부여하지 않는다.
            // (예전에는 ROLE_ADMIN 으로 폴백해 fail-open 이었다.)
            if (role == null || role.isBlank()) {
                log.warn("JWT without a role claim for subject '{}'; refusing to authenticate.", subject);
                SecurityContextHolder.clearContext();
                filterChain.doFilter(request, response);
                return;
            }

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            subject, null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role)));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
