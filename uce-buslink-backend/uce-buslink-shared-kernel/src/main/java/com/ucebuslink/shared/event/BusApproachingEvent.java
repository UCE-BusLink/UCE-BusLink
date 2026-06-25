package com.ucebuslink.shared.event;

import java.util.UUID;

public record BusApproachingEvent(
    UUID tripId,
    UUID userId,
    int estimatedMinutes
) {}