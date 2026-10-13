package com.unpredictableXCoder.FocusPlannerBackend.exceptions;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ErrorResponse
{
    private String path;
    private int status;
    private String error;
    private String message;
    private LocalDateTime timestamp;
}
