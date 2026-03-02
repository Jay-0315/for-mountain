package com.mountain.for_mountain.common;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    //400
    INVALID_OPERATOR(HttpStatus.BAD_REQUEST, "Unknown operator."),
    DIVISION_BY_ZERO(HttpStatus.BAD_REQUEST, "Cannot divide by zero."),
    INVALID_CURRENCY(HttpStatus.BAD_REQUEST, "Unknown currency."),
    EXCHANGE_RATE_FETCH_FAILED(HttpStatus.BAD_GATEWAY, "Cannot fetch exchange rates."),

    // 401 - Auth
    INVALID_ADMIN_CODE(HttpStatus.UNAUTHORIZED, "Invalid admin code."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "JWT token is invalid or expired."),
    MISSING_TOKEN(HttpStatus.UNAUTHORIZED, "Authorization token is missing."),

    // 403
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "Access denied."),

    // 404
    BOARD_NOT_FOUND(HttpStatus.NOT_FOUND, "Board post not found."),

    // 500
    MAIL_SEND_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send contact email.");

    private final HttpStatus httpStatus;
    private final String message;
}
