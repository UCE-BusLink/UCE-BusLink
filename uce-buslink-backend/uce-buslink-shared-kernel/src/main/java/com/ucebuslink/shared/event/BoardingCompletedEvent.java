package com.ucebuslink.shared.event;

import java.util.UUID;

public record BoardingCompletedEvent(
    UUID tripId,
    UUID userId
) {}