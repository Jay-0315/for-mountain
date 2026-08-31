package com.mountain.for_mountain.domain.auth.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.config.JwtService;
import com.mountain.for_mountain.domain.auth.dto.AdminLoginRequest;
import com.mountain.for_mountain.domain.auth.dto.TokenResponse;
import com.mountain.for_mountain.domain.auth.model.entity.AdminAccount;
import com.mountain.for_mountain.domain.auth.repository.AdminAccountRepository;
import com.mountain.for_mountain.domain.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final JwtService jwtService;
    private final AdminAccountRepository adminAccountRepository;
    private final EmployeeRepository employeeRepository;
    private final AccountManagementService accountManagementService;
    private final PasswordEncoder passwordEncoder;
    private final LoginAttemptService loginAttemptService;

    @Transactional
    public TokenResponse login(AdminLoginRequest request) {
        String username = request.getUsername();

        if (loginAttemptService.isBlocked(username)) {
            throw new CustomException(ErrorCode.TOO_MANY_LOGIN_ATTEMPTS);
        }

        AdminAccount admin = adminAccountRepository.findByUsername(username)
                .orElse(null);
        // 존재하지 않는 사번도 실패로 집계한다. (사번 열거 방지 + 무한 시도 차단)
        if (admin == null) {
            loginAttemptService.recordFailure(username);
            throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (!admin.isActive()) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }
        if (!admin.hasPassword()) {
            throw new CustomException(ErrorCode.PASSWORD_NOT_SET);
        }
        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            loginAttemptService.recordFailure(username);
            throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
        }

        loginAttemptService.reset(username);

        employeeRepository.findByEmployeeNumber(admin.getUsername())
                .ifPresent(employee -> admin.syncIdentity(
                        employee.getEmployeeNumber(),
                        accountManagementService.resolveRole(employee.getPosition(), employee.getDepartment())
                ));
        admin.markLogin();
        String token = jwtService.generateAccessToken(admin.getUsername(), admin.getRole());
        return new TokenResponse(token, "Bearer");
    }
}
