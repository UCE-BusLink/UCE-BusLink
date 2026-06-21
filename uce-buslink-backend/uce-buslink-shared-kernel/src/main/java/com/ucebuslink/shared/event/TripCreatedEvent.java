package com.ucebuslink.shared.event;

import java.util.UUID;

public record TripCreatedEvent(
    UUID tripId,
    Integer seatCapacity
) {}