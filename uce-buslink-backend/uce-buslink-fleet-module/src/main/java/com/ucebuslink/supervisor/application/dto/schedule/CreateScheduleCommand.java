package com.ucebuslink.supervisor.application.dto.schedule;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record CreateScheduleCommand(
    @NotNull(message = "Route ID is required")
    UUID routeId,

    @NotEmpty(message = "At least one schedule detail must be provided")
    @Valid
    List<ScheduleDetailCommand> details
) {}