package com.ucebuslink.shared.event;

import java.util.UUID;

public record ReservationCancelledEvent(
    UUID tripId,
    UUID userId
) {}