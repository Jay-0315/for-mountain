package com.mountain.for_mountain.domain.auth.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.auth.dto.CreateEmployeeAccountResponse;
import com.mountain.for_mountain.domain.auth.model.entity.AdminAccount;
import com.mountain.for_mountain.domain.auth.repository.AdminAccountRepository;
import com.mountain.for_mountain.domain.employee.model.entity.Employee;
import com.mountain.for_mountain.domain.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountManagementService {

    private final AdminAccountRepository adminAccountRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.setup-token-expiration-minutes:1440}")
    private long setupTokenExpirationMinutes;

    @Transactional
    public CreateEmployeeAccountResponse createEmployeeAccount(String employeeNumber) {
        String username = employeeNumber.trim();
        Employee employee = employeeRepository.findByEmployeeNumber(username)
                .orElseThrow(() -> new CustomException(ErrorCode.ACCOUNT_NOT_FOUND));
        if (adminAccountRepository.findByUsername(username).isPresent()) {
            throw new CustomException(ErrorCode.ACCOUNT_ALREADY_EXISTS);
        }

        String setupToken = UUID.randomUUID().toString().replace("-", "");
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(setupTokenExpirationMinutes);
        AdminAccount account = AdminAccount.pending(username, resolveRole(employee.getPosition(), employee.getDepartment()), setupToken, expiresAt);
        adminAccountRepository.save(account);

        return new CreateEmployeeAccountResponse(username, setupToken, expiresAt);
    }

    @Transactional
    public void setupPassword(String username, String setupToken, String newPassword) {
        if (newPassword == null || newPassword.length() < 4) {
            throw new CustomException(ErrorCode.WEAK_PASSWORD);
        }

        AdminAccount account = adminAccountRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.ACCOUNT_NOT_FOUND));

        if (account.getSetupToken() == null || !account.getSetupToken().equals(setupToken)) {
            throw new CustomException(ErrorCode.INVALID_SETUP_TOKEN);
        }
        if (account.getSetupTokenExpiresAt() == null || account.getSetupTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new CustomException(ErrorCode.SETUP_TOKEN_EXPIRED);
        }

        account.completePasswordSetup(passwordEncoder.encode(newPassword));
    }

    public String resolveRole(String position, String department) {
        if ("営業１グループ".equals(department)) return "ADMIN";
        return "主任".equals(position) || "社員".equals(position) ? "USER" : "ADMIN";
    }
}
