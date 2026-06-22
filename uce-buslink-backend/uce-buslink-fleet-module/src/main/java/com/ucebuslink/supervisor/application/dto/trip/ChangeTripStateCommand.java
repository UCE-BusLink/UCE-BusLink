package com.ucebuslink.supervisor.application.dto.trip;

import com.ucebuslink.shared.constant.*;
import jakarta.validation.constraints.NotNull;

public record ChangeTripStateCommand(
    @NotNull(message = "El nuevo estado es obligatorio") 
    TripState newState
) {}