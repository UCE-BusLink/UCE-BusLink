package com.ucebuslink.supervisor.application.dto.trip;

import com.ucebuslink.shared.constant.*;
import jakarta.validation.constraints.NotNull;

public record ChangeTripStateCommand(
    @NotNull(message = "The new state is required")
    TripState newState
) {}