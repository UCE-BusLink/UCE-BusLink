package com.ucebuslink.supervisor.application.dto.route;

import jakarta.validation.constraints.NotNull;

public record ChangeRouteStatusCommand(
        @NotNull(message = "El estado (isActive) es obligatorio")
        Boolean isActive
) {}