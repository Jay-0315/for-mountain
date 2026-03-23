package com.mountain.for_mountain.domain.leave.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leaves")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Leave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    // 有給休暇 / 慶弔休暇 / 病気休暇 / 無給休暇
    @Column(nullable = false, length = 20)
    private String leaveType;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private Integer days;

    @Column(length = 500)
    private String reason;

    // 待機中 / 承認 / 拒否
    @Column(nullable = false, length = 10)
    private String status;

    @Column(nullable = false)
    private LocalDate appliedAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public static Leave create(Long employeeId, String leaveType, LocalDate startDate,
                               LocalDate endDate, Integer days, String reason) {
        Leave l = new Leave();
        l.employeeId = employeeId;
        l.leaveType = leaveType;
        l.startDate = startDate;
        l.endDate = endDate;
        l.days = days;
        l.reason = reason;
        l.status = "待機中";
        l.appliedAt = LocalDate.now();
        l.createdAt = LocalDateTime.now();
        l.updatedAt = LocalDateTime.now();
        return l;
    }

    public void updateStatus(String status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateDetails(String leaveType, LocalDate startDate, LocalDate endDate, Integer days, String reason) {
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.days = days;
        this.reason = reason;
        this.updatedAt = LocalDateTime.now();
    }
}
