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
    INVALID_UPLOAD_REQUEST(HttpStatus.BAD_REQUEST, "Invalid upload request."),
    INSUFFICIENT_LEAVE_BALANCE(HttpStatus.BAD_REQUEST, "申請日数が残りの休暇日数を超えています。"),
    EMPLOYEE_PROFILE_INCOMPLETE(HttpStatus.BAD_REQUEST, "Employee profile must be completed before applying for leave."),
    INVALID_GROUP_PARENT(HttpStatus.BAD_REQUEST, "Invalid parent group."),
    INVALID_GROUP_MEMBER(HttpStatus.BAD_REQUEST, "Invalid group member."),
    WEAK_PASSWORD(HttpStatus.BAD_REQUEST, "パスワードは8文字以上で設定してください。"),
    TOO_MANY_LOGIN_ATTEMPTS(HttpStatus.TOO_MANY_REQUESTS,
        "ログイン試行回数が上限を超えました。しばらくしてから再度お試しください。"),
    INVALID_SETUP_TOKEN(HttpStatus.BAD_REQUEST, "Invalid setup token."),
    SETUP_TOKEN_EXPIRED(HttpStatus.BAD_REQUEST, "Setup token has expired."),

    // 401 - Auth
    INVALID_ADMIN_CODE(HttpStatus.UNAUTHORIZED, "Invalid admin code."),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Invalid username or password."),
    PASSWORD_NOT_SET(HttpStatus.UNAUTHORIZED, "Password is not set. Complete password setup first."),
    LINE_WORKS_ACCOUNT_NOT_LINKED(HttpStatus.UNAUTHORIZED, "LINE WORKS account is not linked to an employee."),
    LINE_WORKS_OAUTH_STATE_INVALID(HttpStatus.BAD_REQUEST, "LINE WORKS OAuth state is invalid or expired."),
    LINE_WORKS_OAUTH_FAILED(HttpStatus.BAD_GATEWAY, "LINE WORKS OAuth authentication failed."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "JWT token is invalid or expired."),
    MISSING_TOKEN(HttpStatus.UNAUTHORIZED, "Authorization token is missing."),

    // 403
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "Access denied."),

    // 404
    BOARD_NOT_FOUND(HttpStatus.NOT_FOUND, "Board post not found."),
    PARTNER_CARD_NOT_FOUND(HttpStatus.NOT_FOUND, "Partner card not found."),
    PRODUCT_CARD_NOT_FOUND(HttpStatus.NOT_FOUND, "Product card not found."),
    SERVICE_CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "Service category not found."),
    SERVICE_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "Service item not found."),
    DEPT_NOTICE_NOT_FOUND(HttpStatus.NOT_FOUND, "Department notice not found."),
    LEAVE_NOT_FOUND(HttpStatus.NOT_FOUND, "Leave request not found."),
    GROUP_NOT_FOUND(HttpStatus.NOT_FOUND, "Group not found."),
    ACCOUNT_NOT_FOUND(HttpStatus.NOT_FOUND, "Account not found."),

    // 409
    ACCOUNT_ALREADY_EXISTS(HttpStatus.CONFLICT, "Account already exists."),
    SERVICE_CATEGORY_IN_USE(HttpStatus.CONFLICT, "Service category is in use."),

    // 500
    S3_NOT_CONFIGURED(HttpStatus.INTERNAL_SERVER_ERROR, "S3 upload is not configured."),
    FILE_UPLOAD_PREPARE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to prepare file upload."),
    MAIL_SEND_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send contact email.");

    private final HttpStatus httpStatus;
    private final String message;
}
