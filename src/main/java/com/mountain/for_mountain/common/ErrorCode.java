package com.mountain.for_mountain.common;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    //400
    INVALID_OPERATOR(HttpStatus.BAD_REQUEST, "Unknown operator."),
    DIVISION_BY_ZERO(HttpStatus.BAD_REQUEST, "Cannot divide by zero.");

    private final HttpStatus httpStatus;
    private final String message;
}
