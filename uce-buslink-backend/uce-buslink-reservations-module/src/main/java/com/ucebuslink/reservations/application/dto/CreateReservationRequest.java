package com.ucebuslink.reservations.application.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record CreateReservationRequest(
    @NotNull(message = "Trip ID is required")
    UUID tripId,

    UUID seatId,

    @NotNull(message = "Boarding stop ID is required")
    UUID boardingStopId
) {}