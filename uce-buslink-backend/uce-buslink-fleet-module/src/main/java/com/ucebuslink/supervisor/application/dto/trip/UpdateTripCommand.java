package com.ucebuslink.supervisor.application.dto.trip;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

public record UpdateTripCommand(
    @NotNull(message = "El ID de la ruta es obligatorio") 
    UUID routeId,
    
    @NotNull(message = "El ID del bus es obligatorio") 
    UUID busId,
    
    @NotNull(message = "El ID del conductor es obligatorio") 
    UUID driverId,
    
    @NotNull(message = "La hora de salida es obligatoria") 
    @Future(message = "La hora de salida debe ser en el futuro") 
    LocalDateTime departureTime
) {}