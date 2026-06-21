package com.ucebuslink.reservations.application.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateReservationCommand(
    @NotNull(message = "El ID del viaje es obligatorio") UUID tripId,
    @NotNull(message = "El ID del asiento es obligatorio") UUID seatId,
    @NotNull(message = "El ID de la parada de abordaje es obligatorio") UUID boardingStopId,
    @NotNull(message = "El ID del usuario es obligatorio") UUID userId // En producción, extraer esto del Token JWT en el controller
) {}