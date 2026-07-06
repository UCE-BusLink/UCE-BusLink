package com.ucebuslink.shared.event;

import java.util.UUID;

public record TripDelayedEvent(
    UUID tripId,
    UUID driverId,
    String reason,
    int delayMinutes
) {}
