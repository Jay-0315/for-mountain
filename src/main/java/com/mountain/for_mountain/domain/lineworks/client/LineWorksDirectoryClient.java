package com.mountain.for_mountain.domain.lineworks.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.mountain.for_mountain.domain.lineworks.model.LineWorksOrgUnit;
import com.mountain.for_mountain.domain.lineworks.model.LineWorksOrgUnitMember;
import com.mountain.for_mountain.domain.lineworks.model.LineWorksUser;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Component
@Slf4j
public class LineWorksDirectoryClient {

    private static final String JWT_BEARER_GRANT = "urn:ietf:params:oauth:grant-type:jwt-bearer";
    private static final String DIRECTORY_SCOPE = "user.read user.email.read user.profile.read orgunit.read group.read";

    private final RestClient authClient;
    private final RestClient apiClient;

    @Value("${line-works.enabled:false}")
    private boolean enabled;

    @Value("${line-works.client-id:}")
    private String clientId;

    @Value("${line-works.client-secret:}")
    private String clientSecret;

    @Value("${line-works.service-account:}")
    private String serviceAccount;

    @Value("${line-works.private-key:}")
    private String privateKey;

    @Value("${line-works.auth-base-url:https://auth.worksmobile.com}")
    private String authBaseUrl;

    @Value("${line-works.api-base-url:https://www.worksapis.com/v1.0}")
    private String apiBaseUrl;

    private String accessToken;
    private Instant accessTokenExpiresAt = Instant.EPOCH;

    public LineWorksDirectoryClient() {
        this.authClient = RestClient.create();
        this.apiClient = RestClient.create();
    }

    public boolean isConfigured() {
        return enabled
                && hasText(clientId)
                && hasText(clientSecret)
                && hasText(serviceAccount)
                && hasText(privateKey);
    }

    public List<LineWorksUser> getUsers() {
        return fetchPaged("/users", "users").stream()
                .map(this::toUser)
                .toList();
    }

    public List<LineWorksOrgUnit> getOrgUnits() {
        return fetchPaged("/orgunits", "orgUnits").stream()
                .map(this::toOrgUnit)
                .toList();
    }

    public List<LineWorksOrgUnitMember> getOrgUnitMembers(String orgUnitId) {
        if (!hasText(orgUnitId)) {
            return List.of();
        }
        JsonNode response = apiGet("/orgunits/" + orgUnitId + "/members");
        JsonNode items = firstArray(response, "members", "users");
        List<LineWorksOrgUnitMember> members = new ArrayList<>();
        for (JsonNode item : items) {
            members.add(new LineWorksOrgUnitMember(
                    text(item, "id", "userId", "orgUnitId"),
                    text(item, "type"),
                    text(item, "externalKey", "userExternalKey", "orgUnitExternalKey"),
                    item.path("isManager").asBoolean(false)
            ));
        }
        return members;
    }

    private List<JsonNode> fetchPaged(String path, String arrayField) {
        List<JsonNode> results = new ArrayList<>();
        String cursor = null;
        do {
            String requestPath = cursor == null ? path : path + "?cursor=" + cursor;
            JsonNode response = apiGet(requestPath);
            JsonNode items = firstArray(response, arrayField, "items");
            for (JsonNode item : items) {
                results.add(item);
            }
            cursor = text(response.path("responseMetaData"), "nextCursor");
            if (!hasText(cursor)) {
                cursor = text(response, "nextCursor");
            }
        } while (hasText(cursor));
        return results;
    }

    private JsonNode apiGet(String path) {
        return apiClient.get()
                .uri(apiBaseUrl + path)
                .headers(headers -> headers.setBearerAuth(getAccessToken()))
                .retrieve()
                .body(JsonNode.class);
    }

    private String getAccessToken() {
        Instant now = Instant.now();
        if (hasText(accessToken) && accessTokenExpiresAt.isAfter(now.plusSeconds(60))) {
            return accessToken;
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", JWT_BEARER_GRANT);
        form.add("assertion", createAssertion(now));
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("scope", DIRECTORY_SCOPE);

        JsonNode response = authClient.post()
                .uri(authBaseUrl + "/oauth2/v2.0/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(JsonNode.class);

        accessToken = response.path("access_token").asText();
        long expiresIn = response.path("expires_in").asLong(3600);
        accessTokenExpiresAt = now.plusSeconds(Math.max(60, expiresIn - 60));
        return accessToken;
    }

    private String createAssertion(Instant now) {
        try {
            PrivateKey key = parsePrivateKey(privateKey);
            return Jwts.builder()
                    .header().type("JWT").and()
                    .issuer(clientId)
                    .subject(serviceAccount)
                    .audience().add(authBaseUrl).and()
                    .issuedAt(java.util.Date.from(now))
                    .expiration(java.util.Date.from(now.plusSeconds(1800)))
                    .signWith(key, Jwts.SIG.RS256)
                    .compact();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to create LINE WORKS service account assertion.", e);
        }
    }

    private PrivateKey parsePrivateKey(String value) throws Exception {
        String normalized = value
                .replace("\\n", "\n")
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
        byte[] bytes = Base64.getDecoder().decode(normalized.getBytes(StandardCharsets.UTF_8));
        return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(bytes));
    }

    private LineWorksUser toUser(JsonNode node) {
        String email = text(node, "email");
        if (!hasText(email)) {
            email = text(firstArray(node, "emails"), "email", "address");
        }
        String name = text(node, "userName", "name", "displayName");
        if (!hasText(name)) {
            JsonNode userName = node.path("userName");
            name = text(userName, "lastName") + text(userName, "firstName");
        }
        return new LineWorksUser(
                text(node, "userId"),
                text(node, "userExternalKey"),
                text(node, "loginId"),
                email,
                name,
                text(node, "phoneticName", "phoneticLastName"),
                text(node.path("position"), "positionName", "name"),
                text(firstArray(node, "orgUnits"), "orgUnitId"),
                resolveUserStatus(node)
        );
    }

    private LineWorksOrgUnit toOrgUnit(JsonNode node) {
        return new LineWorksOrgUnit(
                text(node, "orgUnitId"),
                text(node, "orgUnitExternalKey"),
                text(node, "orgUnitName", "name"),
                text(node, "parentOrgUnitId"),
                text(node.path("manager"), "userId")
        );
    }

    private String resolveUserStatus(JsonNode node) {
        if (node.path("isDeleted").asBoolean(false)) return "退職";
        if (node.path("isSuspended").asBoolean(false)) return "休職";
        return "在籍";
    }

    private JsonNode firstArray(JsonNode node, String... names) {
        for (String name : names) {
            JsonNode value = node.path(name);
            if (value.isArray()) {
                return value;
            }
        }
        return com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.arrayNode();
    }

    private String text(JsonNode node, String... names) {
        for (String name : names) {
            JsonNode value = node.path(name);
            if (value.isTextual() && hasText(value.asText())) {
                return value.asText().trim();
            }
        }
        return "";
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
