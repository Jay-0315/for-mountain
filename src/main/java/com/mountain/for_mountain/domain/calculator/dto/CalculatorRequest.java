package com.mountain.for_mountain.domain.calculator.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;

@Getter
@Schema
@RequiredArgsConstructor
public class CalculatorRequest {

    @Schema(example = "123")
    private double num1;

    @Schema(example = "123")
    private double num2;

    @Schema(example = "*")
    private String operator;
}
