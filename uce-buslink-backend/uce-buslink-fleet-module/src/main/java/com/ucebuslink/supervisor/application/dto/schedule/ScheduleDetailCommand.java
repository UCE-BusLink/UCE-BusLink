package com.ucebuslink.supervisor.application.dto.schedule;

import com.ucebuslink.shared.constant.ScheduleType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

public record ScheduleDetailCommand(
    @NotNull(message = "Schedule type is required")
    ScheduleType type,

    @NotEmpty(message = "At least one day of the week must be specified")
    Set<DayOfWeek> daysOfWeek,

    List<LocalTime> fixedDepartureTimes,
    LocalTime frequencyStartTime,
    LocalTime frequencyEndTime,
    Integer frequencyIntervalMinutes
) {}