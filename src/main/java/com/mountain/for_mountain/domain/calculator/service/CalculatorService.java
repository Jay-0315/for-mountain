package com.mountain.for_mountain.domain.calculator.service;


import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.calculator.model.entity.CalculatorHistory;
import com.mountain.for_mountain.domain.calculator.repository.CalculatorHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CalculatorService {

    private final CalculatorHistoryRepository repository;

    @Transactional
    public double calculateAndSave(double num1, double num2, String operator){

        double result = simpleCalculation(num1, num2, operator);

        CalculatorHistory history = new CalculatorHistory(num1, num2, operator, result);

        repository.save(history);

        return result;
    }

    private double simpleCalculation(double num1, double num2, String operator){
        switch (operator){
            case "+":
                return num1 + num2;
                case "-":
                    return num1 - num2;
                    case "*":
                        return num1 * num2;
                        case "/":
                            if (num2 == 0) {
                                throw new CustomException(ErrorCode.DIVISION_BY_ZERO);
                            }
                            return num1 / num2;
                            default:
                                throw new CustomException(ErrorCode.INVALID_OPERATOR);

        }
    }
}
