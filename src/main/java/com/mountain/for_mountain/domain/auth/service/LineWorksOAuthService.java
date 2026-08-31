package com.mountain.for_mountain.domain.auth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.config.JwtService;
import com.mountain.for_mountain.domain.auth.dto.LineWorksOAuthAuthorizeResponse;
import com.mountain.for_mountain.domain.auth.dto.TokenResponse;
import com.mountain.for_mountain.domain.employee.model.entity.Employee;
import com.mountain.for_mountain.domain.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class LineWorksOAuthService {

    private static final String AUTHORIZATION_ENDPOINT = "/oauth2/v2.0/authorize";
    private static final String TOKEN_ENDPOINT = "/oauth2/v2.0/token";
    private static final String USERINFO_ENDPOINT = "/oauth2/v2.0/userinfo";
    private static final long STATE_TTL_SECONDS = 600;

    private final EmployeeRepository employeeRepository;
    private final AccountManagementService accountManagementService;
    private final JwtService jwtService;

    @Value("${line-works.enabled:false}")
    private boolean enabled;
    @Value("${line-works.client-id:}")
    private String clientId;
    @Value("${line-works.client-secret:}")
    private String clientSecret;
    @Value("${line-works.auth-base-url:https://auth.worksmobile.com}")
    private String authBaseUrl;
    @Value("${line-works.oauth-redirect-uri:}")
    private String redirectUri;

    private final RestClient restClient = RestClient.create();
    private final Map<String, Instant> states = new ConcurrentHashMap<>();

    public LineWorksOAuthAuthorizeResponse createAuthorizationUrl() {
        ensureConfigured();
        purgeExpiredStates();
        String state = UUID.randomUUID().toString();
        states.put(state, Instant.now().plusSeconds(STATE_TTL_SECONDS));

        String url = UriComponentsBuilder.fromUriString(authBaseUrl + AUTHORIZATION_ENDPOINT)
                .queryParam("response_type", "code")
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("scope", "openid profile email")
                .queryParam("state", state)
                .build()
                .encode()
                .toUriString();
        return new LineWorksOAuthAuthorizeResponse(url);
    }

    public TokenResponse exchange(String code, String state) {
        ensureConfigured();
        Instant expiresAt = states.remove(state);
        if (expiresAt == null || expiresAt.isBefore(Instant.now())) {
            throw new CustomException(ErrorCode.LINE_WORKS_OAUTH_STATE_INVALID);
        }
        if (code == null || code.isBlank()) {
            throw new CustomException(ErrorCode.LINE_WORKS_OAUTH_FAILED);
        }

        try {
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("grant_type", "authorization_code");
            form.add("code", code);
            form.add("client_id", clientId);
            form.add("client_secret", clientSecret);
            form.add("redirect_uri", redirectUri);

            JsonNode token = restClient.post()
                    .uri(authBaseUrl + TOKEN_ENDPOINT)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(JsonNode.class);
            String accessToken = token.path("access_token").asText("");
            if (accessToken.isBlank()) {
                throw new CustomException(ErrorCode.LINE_WORKS_OAUTH_FAILED);
            }

            JsonNode userInfo = restClient.get()
                    .uri(authBaseUrl + USERINFO_ENDPOINT)
                    .headers(headers -> headers.setBearerAuth(accessToken))
                    .retrieve()
                    .body(JsonNode.class);
            String lineWorksUserId = userInfo.path("sub").asText("");
            String email = userInfo.path("email").asText("");
            Employee employee = employeeRepository.findByLineWorksUserId(lineWorksUserId)
                    .or(() -> findByEmail(email))
                    .orElseThrow(() -> new CustomException(ErrorCode.LINE_WORKS_ACCOUNT_NOT_LINKED));

            // OAuth login is also the first secure account-linking point for legacy users.
            if (!lineWorksUserId.isBlank() && !lineWorksUserId.equals(employee.getLineWorksUserId())) {
                employee.syncLineWorksIdentity(lineWorksUserId, employee.getLineWorksExternalKey());
            }
            String role = accountManagementService.resolveRole(employee.getPosition(), employee.getDepartment());
            return new TokenResponse(jwtService.generateAccessToken(employee.getEmployeeNumber(), role), "Bearer");
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.LINE_WORKS_OAUTH_FAILED);
        }
    }

    private java.util.Optional<Employee> findByEmail(String email) {
        if (email == null || email.isBlank()) return java.util.Optional.empty();
        return employeeRepository.findAllByOrderByJoinDateDesc().stream()
                .filter(employee -> email.equalsIgnoreCase(employee.getEmail()))
                .findFirst();
    }

    private void ensureConfigured() {
        if (!enabled || clientId.isBlank() || clientSecret.isBlank() || redirectUri.isBlank()) {
            throw new CustomException(ErrorCode.LINE_WORKS_OAUTH_FAILED);
        }
    }

    private void purgeExpiredStates() {
        Instant now = Instant.now();
        states.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
    }
}
