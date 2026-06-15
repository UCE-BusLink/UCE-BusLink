package com.ucebuslink.supervisor.application.dto;

import com.ucebuslink.supervisor.domain.model.BusStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeBusStatusCommand(
    @NotNull(message = "El estado es obligatorio") BusStatus status
) {}