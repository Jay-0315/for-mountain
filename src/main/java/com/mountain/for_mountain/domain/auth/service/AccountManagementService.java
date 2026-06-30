package com.mountain.for_mountain.domain.auth.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.auth.dto.CreateEmployeeAccountResponse;
import com.mountain.for_mountain.domain.auth.model.entity.AdminAccount;
import com.mountain.for_mountain.domain.auth.repository.AdminAccountRepository;
import com.mountain.for_mountain.domain.employee.model.entity.Employee;
import com.mountain.for_mountain.domain.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountManagementService {

    private final AdminAccountRepository adminAccountRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${app.admin.setup-token-expiration-minutes:10080}")
    private long setupTokenExpirationMinutes;

    @Value("${app.admin.reset-token-expiration-minutes:30}")
    private long resetTokenExpirationMinutes;

    @Value("${app.frontend-base-url:}")
    private String frontendBaseUrl;

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

    /**
     * 비밀번호 찾기: 사번으로 계정을 찾아 재설정 토큰을 만들고, 사원 이메일로 재설정 링크를 보낸다.
     * 계정 존재 여부를 노출하지 않기 위해 계정/이메일이 없어도 조용히 종료한다.
     */
    @Transactional
    public void requestPasswordReset(String username) {
        String normalized = username == null ? "" : username.trim();
        if (normalized.isEmpty()) {
            return;
        }

        AdminAccount account = adminAccountRepository.findByUsername(normalized).orElse(null);
        if (account == null || !account.isActive()) {
            return;
        }

        String email = employeeRepository.findByEmployeeNumber(normalized)
                .map(Employee::getEmail)
                .orElse(null);
        if (email == null || email.isBlank()) {
            return;
        }

        String resetToken = UUID.randomUUID().toString().replace("-", "");
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(resetTokenExpirationMinutes);
        account.setSetupToken(resetToken, expiresAt);

        sendPasswordResetMail(email, normalized, resetToken);
    }

    /** 로그인된 사용자의 비밀번호 변경. 현재 비밀번호 확인 후 변경한다. */
    @Transactional
    public void changePassword(String username, String currentPassword, String newPassword) {
        if (newPassword == null || newPassword.length() < 4) {
            throw new CustomException(ErrorCode.WEAK_PASSWORD);
        }

        AdminAccount account = adminAccountRepository.findByUsername(username == null ? "" : username.trim())
                .orElseThrow(() -> new CustomException(ErrorCode.ACCOUNT_NOT_FOUND));

        if (!account.hasPassword() || !passwordEncoder.matches(currentPassword, account.getPasswordHash())) {
            throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
        }

        account.updatePasswordHash(passwordEncoder.encode(newPassword));
    }

    private void sendPasswordResetMail(String email, String username, String resetToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("【パスワード再設定】");
            message.setText(buildPasswordResetMailBody(username, resetToken));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send password reset mail for {}", username, e);
        }
    }

    private String buildPasswordResetMailBody(String username, String resetToken) {
        String resetUrl = buildPasswordResetUrl(username, resetToken);
        StringBuilder body = new StringBuilder()
                .append("パスワード再設定のリクエストを受け付けました。\n\n")
                .append("ID（社員番号）: ").append(username).append("\n")
                .append("有効期限: ").append(resetTokenExpirationMinutes).append("分\n\n");
        if (resetUrl != null) {
            body.append("下記のリンクから新しいパスワードを設定してください。\n")
                .append(resetUrl).append("\n\n");
        } else {
            body.append("再設定トークン: ").append(resetToken).append("\n\n");
        }
        body.append("本メールに心当たりがない場合は破棄してください。");
        return body.toString();
    }

    private String buildPasswordResetUrl(String username, String resetToken) {
        if (frontendBaseUrl == null || frontendBaseUrl.isBlank()) {
            return null;
        }
        String base = frontendBaseUrl.endsWith("/")
                ? frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1)
                : frontendBaseUrl;
        return base + "/account/setup?mode=reset&username=" + username + "&token=" + resetToken;
    }

    public String resolveRole(String position, String department) {
        if ("営業１グループ".equals(department)) return "ADMIN";
        return "主任".equals(position) || "社員".equals(position) ? "USER" : "ADMIN";
    }
}
