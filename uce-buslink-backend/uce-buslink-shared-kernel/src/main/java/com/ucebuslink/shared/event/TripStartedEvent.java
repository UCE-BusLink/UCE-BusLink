package com.ucebuslink.shared.event;

import java.util.List;
import java.util.UUID;

public record TripStartedEvent(
    UUID tripId,
    List<UUID> studentIds
) {}