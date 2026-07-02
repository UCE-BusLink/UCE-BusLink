package com.ucebuslink.shared.event;

import java.util.List;
import java.util.UUID;

public record TripCompletedEvent(
    UUID tripId,
    List<UUID> studentIds
) {}
