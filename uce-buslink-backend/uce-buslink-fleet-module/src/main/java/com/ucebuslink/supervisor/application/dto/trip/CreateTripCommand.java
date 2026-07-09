package com.ucebuslink.supervisor.application.dto.trip;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CreateTripCommand(
    @NotNull(message = "The route ID is required")
    UUID routeId,

    @NotNull(message = "The bus ID is required")
    UUID busId,

    @NotNull(message = "The driver ID is required")
    UUID driverId,

    @NotEmpty(message = "At least one departure date and time must be sent")
    List<LocalDateTime> departures
) {}