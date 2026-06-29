package com.ucebuslink.shared.event;

import java.util.UUID;

public record ReservationCreatedEvent(
    UUID tripId,
    UUID userId
) {}