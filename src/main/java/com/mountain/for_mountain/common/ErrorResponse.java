package com.mountain.for_mountain.common;

import lombok.Getter;
import lombok.AllArgsConstructor;

@Getter
@AllArgsConstructor
public class ErrorResponse {
    private String message;
    private int statusCode;
}
