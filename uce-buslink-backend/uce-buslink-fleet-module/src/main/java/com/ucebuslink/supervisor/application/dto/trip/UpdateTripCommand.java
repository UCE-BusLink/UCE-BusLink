package com.ucebuslink.supervisor.application.dto.trip;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

public record UpdateTripCommand(
    @NotNull(message = "The route ID is required")
    UUID routeId,

    @NotNull(message = "The bus ID is required")
    UUID busId,

    @NotNull(message = "The driver ID is required")
    UUID driverId,

    @NotNull(message = "The departure time is required")
    @Future(message = "The departure time must be in the future")
    LocalDateTime departureTime
) {}