package com.mountain.for_mountain.domain.auth.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_accounts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AdminAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 30)
    private String role;

    @Column(nullable = false)
    private boolean active;

    @Column
    private LocalDateTime lastLoginAt;

    @Column(unique = true, length = 100)
    private String setupToken;

    @Column
    private LocalDateTime setupTokenExpiresAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public AdminAccount(String username, String passwordHash, String role, boolean active) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
        this.active = active;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void updatePasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
        this.updatedAt = LocalDateTime.now();
    }

    public void syncIdentity(String username, String role) {
        this.username = username;
        this.role = role;
        this.updatedAt = LocalDateTime.now();
    }

    public static AdminAccount pending(String username, String role, String setupToken, LocalDateTime expiresAt) {
        AdminAccount account = new AdminAccount();
        account.username = username;
        account.passwordHash = "";
        account.role = role;
        account.active = true;
        account.setupToken = setupToken;
        account.setupTokenExpiresAt = expiresAt;
        account.createdAt = LocalDateTime.now();
        account.updatedAt = LocalDateTime.now();
        return account;
    }

    public boolean hasPassword() {
        return passwordHash != null && !passwordHash.isBlank();
    }

    public void setSetupToken(String setupToken, LocalDateTime expiresAt) {
        this.setupToken = setupToken;
        this.setupTokenExpiresAt = expiresAt;
        this.updatedAt = LocalDateTime.now();
    }

    public void completePasswordSetup(String encodedPassword) {
        this.passwordHash = encodedPassword;
        this.setupToken = null;
        this.setupTokenExpiresAt = null;
        this.updatedAt = LocalDateTime.now();
    }

    public void markLogin() {
        this.lastLoginAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
