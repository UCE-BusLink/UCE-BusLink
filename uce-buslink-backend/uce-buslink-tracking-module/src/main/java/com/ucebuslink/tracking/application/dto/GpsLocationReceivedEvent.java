package com.ucebuslink.tracking.application.dto;

import java.util.UUID;

public record GpsLocationReceivedEvent(
    UUID tripId,
    double latitude,
    double longitude,
    double accuracy,
    double velocity
) {}