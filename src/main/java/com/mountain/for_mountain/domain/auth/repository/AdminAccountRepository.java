package com.mountain.for_mountain.domain.auth.repository;

import com.mountain.for_mountain.domain.auth.model.entity.AdminAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminAccountRepository extends JpaRepository<AdminAccount, Long> {
    Optional<AdminAccount> findByUsername(String username);
    Optional<AdminAccount> findBySetupToken(String setupToken);
    void deleteByUsername(String username);
}
