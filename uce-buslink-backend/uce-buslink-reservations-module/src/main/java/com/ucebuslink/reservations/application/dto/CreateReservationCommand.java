package com.ucebuslink.reservations.application.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateReservationCommand(
    @NotNull(message = "Trip ID is required") UUID tripId,
    @NotNull(message = "Seat ID is required") UUID seatId,
    @NotNull(message = "Boarding stop ID is required") UUID boardingStopId,
    @NotNull(message = "User ID is required") UUID userId // In production, extract this from the JWT token in the controller
) {}