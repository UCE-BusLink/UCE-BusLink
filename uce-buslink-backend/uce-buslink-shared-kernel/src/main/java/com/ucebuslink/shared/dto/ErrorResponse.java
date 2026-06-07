package com.ucebuslink.shared.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(
    String error,
    String message,
    Map<String, String> fieldErrors,
    LocalDateTime timestamp
) {}