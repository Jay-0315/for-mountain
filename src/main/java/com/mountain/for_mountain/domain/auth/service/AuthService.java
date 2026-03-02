package com.mountain.for_mountain.domain.auth.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.config.JwtService;
import com.mountain.for_mountain.domain.auth.dto.AdminLoginRequest;
import com.mountain.for_mountain.domain.auth.dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtService jwtService;

    @Value("${app.admin.code}")
    private String adminCode;

    public TokenResponse login(AdminLoginRequest request) {
        if (!adminCode.equals(request.getCode())) {
            throw new CustomException(ErrorCode.INVALID_ADMIN_CODE);
        }
        String token = jwtService.generateToken("admin");
        return new TokenResponse(token, "Bearer");
    }
}
