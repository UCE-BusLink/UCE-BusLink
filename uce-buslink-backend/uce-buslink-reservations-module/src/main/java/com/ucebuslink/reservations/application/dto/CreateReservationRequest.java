package com.ucebuslink.reservations.application.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record CreateReservationRequest(
    @NotNull(message = "El ID del viaje es obligatorio")
    UUID tripId,
    
    UUID seatId,

    @NotNull(message = "El ID de la parada de abordaje es obligatorio")
    UUID boardingStopId
) {}