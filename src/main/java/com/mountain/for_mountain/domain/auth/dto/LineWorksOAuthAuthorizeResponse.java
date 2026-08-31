package com.mountain.for_mountain.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LineWorksOAuthAuthorizeResponse {
    private String authorizationUrl;
}
