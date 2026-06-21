package com.ucebuslink.supervisor.application.dto.trip;

import com.ucebuslink.shared.constant.*;
import java.time.LocalDateTime;
import java.util.UUID;

public record TripResponse(
    UUID id,
    UUID routeId,
    UUID busId,
    UUID driverId,
    TripState state,
    LocalDateTime departureTime,
    LocalDateTime estimatedArrivalTime,
    Integer availableSeats
) {}