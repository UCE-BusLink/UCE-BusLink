package com.ucebuslink.shared.event;

import java.util.UUID;

public record NoShowEvent(
    UUID tripId,
    UUID userId
) {}
