package com.mountain.for_mountain.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mountain.for_mountain.common.ErrorResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Swagger UI
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/swagger-ui.html",
                    "/error"
                ).permitAll()
                // Password change requires authentication (must precede the public /auth/** rule)
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/password/change").authenticated()
                // Auth endpoint (public)
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/password/setup").permitAll()
                // ── 공개 웹사이트가 실제로 사용하는 읽기 전용 API만 공개한다 ──
                // 사내 데이터(employees / groups / leaves / announcements / dept-notices)는
                // 아래 anyRequest().authenticated() 로 넘어가 인증을 요구한다.
                .requestMatchers(HttpMethod.GET,
                    "/api/v1/board/**",
                    "/api/v1/service-items/**",
                    "/api/v1/service-categories/**",
                    "/api/v1/partner-cards/**",
                    "/api/v1/product-cards/**",
                    // 공개 페이지에 삽입된 이미지·첨부를 서빙하는 경로
                    "/api/v1/uploads/files/**"
                ).permitAll()
                // Admin account management (admin only)
                .requestMatchers(HttpMethod.POST, "/api/v1/admin/accounts").hasRole("ADMIN")
                // Contact (public)
                .requestMatchers(HttpMethod.POST, "/api/v1/contact").permitAll()
                // LINE WORKS sync (admin only)
                .requestMatchers(HttpMethod.POST, "/api/v1/lineworks/**").hasRole("ADMIN")
                // Board writes (admin only)
                .requestMatchers(HttpMethod.POST,   "/api/v1/board/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/v1/board/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/board/**").hasRole("ADMIN")
                // Uploads (admin only) — presign 뿐 아니라 멀티파트 업로드 자체도 막는다.
                .requestMatchers(HttpMethod.POST,   "/api/v1/uploads/presign").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/v1/uploads").hasRole("ADMIN")
                // Department notice writes (admin only)
                .requestMatchers(HttpMethod.POST,   "/api/v1/dept-notices").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/v1/dept-notices").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/dept-notices").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/v1/dept-notices/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/v1/dept-notices/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/dept-notices/**").hasRole("ADMIN")
                // Employee APIs
                .requestMatchers(HttpMethod.POST, "/api/v1/employees").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/employees").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/employees").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/employees/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/employees/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/employees/**").hasRole("ADMIN")
                // Group APIs
                .requestMatchers(HttpMethod.POST, "/api/v1/groups").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/groups").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/groups").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/groups/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/groups/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/groups/**").hasRole("ADMIN")
                // Leave APIs
                .requestMatchers(HttpMethod.POST, "/api/v1/leaves").hasAnyRole("ADMIN", "USER")
                .requestMatchers(HttpMethod.PUT, "/api/v1/leaves").hasAnyRole("ADMIN", "USER")
                // 승인/거부는 서비스에서 "지정 승인자"만 허용하므로 역할은 둘 다 통과시킨다.
                .requestMatchers(HttpMethod.PATCH, "/api/v1/leaves").hasAnyRole("ADMIN", "USER")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/leaves").hasAnyRole("ADMIN", "USER")
                .requestMatchers(HttpMethod.POST, "/api/v1/leaves/**").hasAnyRole("ADMIN", "USER")
                .requestMatchers(HttpMethod.PUT, "/api/v1/leaves/**").hasAnyRole("ADMIN", "USER")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/leaves/**").hasAnyRole("ADMIN", "USER")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/leaves/**").hasAnyRole("ADMIN", "USER")
                // Internal announcement APIs
                .requestMatchers(HttpMethod.POST, "/api/v1/announcements").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/announcements").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/announcements").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/announcements/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/announcements/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/announcements/**").hasRole("ADMIN")
                // Partner card APIs
                .requestMatchers(HttpMethod.POST, "/api/v1/partner-cards").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/partner-cards").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/partner-cards").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/partner-cards/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/partner-cards/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/partner-cards/**").hasRole("ADMIN")
                // Product card APIs
                .requestMatchers(HttpMethod.POST, "/api/v1/product-cards").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/product-cards").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/product-cards").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/product-cards").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/product-cards/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/product-cards/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/product-cards/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/product-cards/**").hasRole("ADMIN")
                // Service category APIs
                .requestMatchers(HttpMethod.POST, "/api/v1/service-categories").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/service-categories").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/service-categories").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/service-categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/service-categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/service-categories/**").hasRole("ADMIN")
                // Service item APIs
                .requestMatchers(HttpMethod.POST, "/api/v1/service-items").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/service-items").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/service-items").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/service-items/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/service-items/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/service-items/**").hasRole("ADMIN")
                // Existing APIs (public)
                .requestMatchers("/api/v1/calculator/**").permitAll()
                .requestMatchers("/api/v1/exchange/**").permitAll()
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding("UTF-8");
                    String body = objectMapper.writeValueAsString(
                        new ErrorResponse("JWT token is invalid or expired. [security-config-v2]", 401));
                    response.getWriter().write(body);
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding("UTF-8");
                    String body = objectMapper.writeValueAsString(
                        new ErrorResponse("Access denied.", 403));
                    response.getWriter().write(body);
                })
            )
            .addFilterBefore(jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "http://mountain-frontend:3000",
            "https://mountain-info.com",
            "http://mountain-info.com"
        ));
        // PATCH: 휴가 승인/거부(PATCH /api/v1/leaves/{id}/status)에 필요하다.
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
