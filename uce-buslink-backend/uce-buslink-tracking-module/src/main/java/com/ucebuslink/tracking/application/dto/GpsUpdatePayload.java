package com.ucebuslink.tracking.application.dto;

import java.util.UUID;

public record GpsUpdatePayload(
    UUID busId,
    double latitude,
    double longitude,
    double accuracy,
    double velocity,
    long timestamp
) {}