package com.mountain.for_mountain.domain.auth.service;

import com.mountain.for_mountain.domain.auth.model.entity.AdminAccount;
import com.mountain.for_mountain.domain.auth.repository.AdminAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminAccountInitializer implements CommandLineRunner {

    private final AdminAccountRepository adminAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.init-username:admin}")
    private String initUsername;

    @Value("${app.admin.init-password:1234}")
    private String initPassword;

    @Override
    public void run(String... args) {
        adminAccountRepository.findByUsername(initUsername).ifPresentOrElse(existing -> {
            if (!passwordEncoder.matches(initPassword, existing.getPasswordHash())) {
                existing.updatePasswordHash(passwordEncoder.encode(initPassword));
                adminAccountRepository.save(existing);
                log.info("Updated admin account password for '{}'.", initUsername);
            }
        }, () -> {
            AdminAccount admin = new AdminAccount(
                    initUsername,
                    passwordEncoder.encode(initPassword),
                    "ADMIN",
                    true
            );
            adminAccountRepository.save(admin);
            log.info("Created initial admin account '{}'.", initUsername);
        });
    }
}
