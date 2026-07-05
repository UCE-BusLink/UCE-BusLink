package com.ucebuslink.shared.event;

import java.util.UUID;

public record TripReminderEvent(
    UUID tripId,
    UUID driverId,
    int minutesRemaining
) {}
