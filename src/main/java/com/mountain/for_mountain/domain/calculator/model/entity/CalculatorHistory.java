package com.mountain.for_mountain.domain.calculator.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CalculatorHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double num1;
    private double num2;
    private String operator;
    private double result;
    private LocalDateTime createdAt;

    public CalculatorHistory(double num1, double num2, String Operator, double result) {

        this.num1 = num1;
        this.num2 = num2;
        this.operator = Operator;
        this.result = result;
        this.createdAt = LocalDateTime.now();
    }
}
