package com.ucebuslink.tracking.domain.model;

import java.util.UUID;

public record BusLocation(
    UUID busId,
    double latitude,
    double longitude,
    double accuracy,
    double velocity,
    long timestamp
) {}