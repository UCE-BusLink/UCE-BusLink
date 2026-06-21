package com.ucebuslink.shared.event;

import java.util.UUID;

public record TripCompletedEvent(
    UUID tripId
) {}