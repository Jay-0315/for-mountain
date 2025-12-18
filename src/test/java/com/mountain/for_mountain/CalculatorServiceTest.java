package com.mountain.for_mountain;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.calculator.repository.CalculatorHistoryRepository;
import com.mountain.for_mountain.domain.calculator.service.CalculatorService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class) // Mockito
class CalculatorServiceTest {

    @Mock
    private CalculatorHistoryRepository repository;

    @InjectMocks
    private CalculatorService calculatorService;

    @Test
    @DisplayName("save")
    void calculateAndSave_Success() {
        // given
        double num1 = 10;
        double num2 = 20;
        String operator = "+";

        // when
        double result = calculatorService.calculateAndSave(num1, num2, operator);

        // then
        // Is result 30?
        assertThat(result).isEqualTo(30.0);

        // Is saving only 1 time?
        verify(repository, times(1)).save(any());
    }

    @Test
    @DisplayName("if divide by zero throw DIVISION_BY_ZERO")
    void calculateAndSave_DivisionByZero() {
        // given
        double num1 = 10;
        double num2 = 0;
        String operator = "/";

        // when & then
        assertThatThrownBy(() -> calculatorService.calculateAndSave(num1, num2, operator))
                .isInstanceOf(CustomException.class) // CustomException?
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.DIVISION_BY_ZERO); // 에러코드가 DIVISION_BY_ZERO가 맞는가?
    }

    @Test
    @DisplayName("If got wrong operator throw INVALID_OPERATOR")
    void calculateAndSave_InvalidOperator() {
        // given
        double num1 = 10;
        double num2 = 5;
        String operator = "%"; // wrong one

        // when & then
        assertThatThrownBy(() -> calculatorService.calculateAndSave(num1, num2, operator))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_OPERATOR);
    }
}