package com.ucebuslink.shared.event;

import java.util.List;
import java.util.UUID;

public record TripCancelledEvent(
    UUID tripId,
    List<UUID> studentIds,
    String reason
) {}