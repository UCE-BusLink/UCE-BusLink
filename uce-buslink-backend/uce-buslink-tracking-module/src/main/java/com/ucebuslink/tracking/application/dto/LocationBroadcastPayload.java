package com.ucebuslink.tracking.application.dto;

import java.util.UUID;

public record LocationBroadcastPayload(
    UUID busId,
    UUID tripId,
    double latitude,
    double longitude,
    double velocity,
    int etaMinutes,
    String nextStopName
) {}