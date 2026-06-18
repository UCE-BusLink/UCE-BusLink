package com.ucebuslink.shared.dto;

import java.util.UUID;

public record DriverCreatedResponse(
    UUID id,
    String email,
    String message
) {}