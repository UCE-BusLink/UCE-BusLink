package com.ucebuslink.supervisor.application.dto.route;

import jakarta.validation.constraints.NotNull;

public record ChangeRouteStatusCommand(
        @NotNull(message = "The state (isActive) is required")
        Boolean isActive
) {}