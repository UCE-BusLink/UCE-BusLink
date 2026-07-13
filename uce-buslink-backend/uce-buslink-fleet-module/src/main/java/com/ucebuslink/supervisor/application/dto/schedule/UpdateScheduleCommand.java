package com.ucebuslink.supervisor.application.dto.schedule;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record UpdateScheduleCommand(
    @NotEmpty(message = "At least one schedule detail must be provided")
    @Valid
    List<ScheduleDetailCommand> details,

    @NotNull(message = "Active status is required")
    Boolean active
) {}