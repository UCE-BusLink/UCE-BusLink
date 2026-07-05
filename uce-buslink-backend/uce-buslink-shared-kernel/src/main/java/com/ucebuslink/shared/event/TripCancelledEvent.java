package com.ucebuslink.shared.event;

import java.util.List;
import java.util.UUID;

public record TripCancelledEvent(
    UUID tripId,
    UUID driverId,
    List<UUID> studentIds,
    String reason
) {}