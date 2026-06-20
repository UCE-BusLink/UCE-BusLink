package com.ucebuslink.supervisor.application.dto.trip;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CreateTripCommand(
    @NotNull(message = "El ID de la ruta es obligatorio") 
    UUID routeId,
    
    @NotNull(message = "El ID del bus es obligatorio") 
    UUID busId,
    
    @NotNull(message = "El ID del conductor es obligatorio") 
    UUID driverId,
    
    @NotEmpty(message = "Debe enviar al menos una fecha y hora de salida")
    List<LocalDateTime> departures
) {}