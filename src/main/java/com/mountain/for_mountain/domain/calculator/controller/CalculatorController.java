package com.mountain.for_mountain.domain.calculator.controller;

import com.mountain.for_mountain.domain.calculator.service.CalculatorService;
import com.mountain.for_mountain.domain.calculator.dto.CalculatorResponse;
import com.mountain.for_mountain.domain.calculator.dto.CalculatorRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/calculator")
@Tag(name = "Calculator API", description = "Simple Calculator API")
public class CalculatorController {

    private final CalculatorService calculatorService;

    @Operation(summary = "Execute Simple Calculation", description = "Calculation Result")
    @PostMapping("/calculate")
    public ResponseEntity<CalculatorResponse> calculate(@RequestBody CalculatorRequest request) {

        double result = calculatorService.calculateAndSave(
                request.getNum1(),
                request.getNum2(),
                request.getOperator()
        );
        return ResponseEntity.ok(new CalculatorResponse(result));
    }
}