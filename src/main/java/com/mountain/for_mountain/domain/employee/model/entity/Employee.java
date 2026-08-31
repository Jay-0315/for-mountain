package com.mountain.for_mountain.domain.employee.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String employeeNumber;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 100)
    private String nameKana;

    @Column(nullable = false, length = 50)
    private String nationality;

    @Column(nullable = false)
    private LocalDate birthDate;

    // 開発 Part1 / 開発 Part2 / 技術グループ1 / 技術グループ2 / 技術本部 / サービスグループ / 営業１グループ / 管理部
    @Column(nullable = false, length = 50)
    private String department;

    // 代表取締役 / 常務 / 部長 / 次長 / 課長 / 課長代理 / 主任 / 社員
    @Column(nullable = false, length = 30)
    private String position;

    // 役員 / 管理職 / 一般社員
    @Column(nullable = false, length = 30)
    private String jobTitle;

    @Column(nullable = false)
    private LocalDate joinDate;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "line_works_user_id", unique = true, length = 100)
    private String lineWorksUserId;

    @Column(name = "line_works_external_key", unique = true, length = 100)
    private String lineWorksExternalKey;

    // 在籍 / 休職 / 退職
    @Column(nullable = false, length = 10)
    private String status;

    @Column(nullable = true)
    private Integer annualLeaveDays;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "profile_complete", nullable = false)
    private boolean profileComplete = true;

    public static Employee create(String employeeNumber, String name, String nameKana,
                                  String nationality, LocalDate birthDate, String department,
                                  String position, String jobTitle, LocalDate joinDate, String email,
                                  String status, Integer annualLeaveDays) {
        Employee e = new Employee();
        e.employeeNumber = employeeNumber;
        e.name = name;
        e.nameKana = nameKana;
        e.nationality = nationality;
        e.birthDate = birthDate;
        e.department = department;
        e.position = position;
        e.jobTitle = jobTitle;
        e.joinDate = joinDate;
        e.email = email;
        e.status = status;
        e.annualLeaveDays = annualLeaveDays;
        e.profileComplete = true;
        e.createdAt = LocalDateTime.now();
        e.updatedAt = LocalDateTime.now();
        return e;
    }

    public void update(String employeeNumber, String name, String nameKana, String nationality, LocalDate birthDate,
                       String department, String position, String jobTitle, LocalDate joinDate,
                       String email, String status, Integer annualLeaveDays) {
        this.employeeNumber = employeeNumber;
        this.name = name;
        this.nameKana = nameKana;
        this.nationality = nationality;
        this.birthDate = birthDate;
        this.department = department;
        this.position = position;
        this.jobTitle = jobTitle;
        this.joinDate = joinDate;
        this.email = email;
        this.status = status;
        this.annualLeaveDays = annualLeaveDays;
        this.profileComplete = true;
        this.updatedAt = LocalDateTime.now();
    }

    public void syncLineWorksIdentity(String userId, String externalKey) {
        this.lineWorksUserId = userId;
        this.lineWorksExternalKey = externalKey;
        this.updatedAt = LocalDateTime.now();
    }

    public void syncFromLineWorks(String employeeNumber, String name, String nameKana, String department,
                                  String position, String jobTitle, String email, String status,
                                  String lineWorksUserId, String lineWorksExternalKey) {
        this.employeeNumber = employeeNumber;
        this.name = name;
        this.nameKana = nameKana;
        this.department = department;
        this.position = position;
        this.jobTitle = jobTitle;
        this.email = email;
        this.status = status;
        this.lineWorksUserId = lineWorksUserId;
        this.lineWorksExternalKey = lineWorksExternalKey;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateDepartment(String department) {
        this.department = department;
        this.updatedAt = LocalDateTime.now();
    }

    public void syncDirectoryProfile(String name, String email, String department, String position, String status) {
        if (name != null && !name.isBlank()) this.name = name.trim();
        if (email != null && !email.isBlank()) this.email = email.trim();
        if (department != null && !department.isBlank()) this.department = department.trim();
        if (position != null && !position.isBlank()) this.position = position.trim();
        if (status != null && !status.isBlank()) this.status = status.trim();
        this.updatedAt = LocalDateTime.now();
    }

    public static Employee createFromLineWorks(String employeeNumber, String name, String department,
                                               String position, String email, String status,
                                               String lineWorksUserId, String externalKey) {
        Employee e = create(
                employeeNumber,
                name,
                name,
                "未設定",
                LocalDate.of(1900, 1, 1),
                department,
                position,
                "一般社員",
                LocalDate.now(),
                email,
                status,
                0
        );
        e.profileComplete = false;
        e.lineWorksUserId = lineWorksUserId;
        e.lineWorksExternalKey = externalKey;
        return e;
    }

    public boolean isProfileComplete() {
        return profileComplete;
    }
}
