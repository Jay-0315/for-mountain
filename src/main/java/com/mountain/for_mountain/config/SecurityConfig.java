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
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
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
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring().requestMatchers(
            "/api/v1/groups",
            "/api/v1/groups/**"
        );
    }

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
                // Auth endpoint (public)
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/password/setup").permitAll()
                // All read APIs are public
                .requestMatchers(HttpMethod.GET, "/api/v1/**").permitAll()
                // Admin account management (admin only)
                .requestMatchers(HttpMethod.POST, "/api/v1/admin/accounts").hasRole("ADMIN")
                // Contact (public)
                .requestMatchers(HttpMethod.POST, "/api/v1/contact").permitAll()
                // Board writes (admin only)
                .requestMatchers(HttpMethod.POST,   "/api/v1/board/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/v1/board/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/board/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/v1/uploads/presign").hasRole("ADMIN")
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
                .requestMatchers(HttpMethod.PATCH, "/api/v1/leaves").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/leaves").hasAnyRole("ADMIN", "USER")
                .requestMatchers(HttpMethod.POST, "/api/v1/leaves/**").hasAnyRole("ADMIN", "USER")
                .requestMatchers(HttpMethod.PUT, "/api/v1/leaves/**").hasAnyRole("ADMIN", "USER")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/leaves/**").hasRole("ADMIN")
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
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
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
