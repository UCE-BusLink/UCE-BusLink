package com.ucebuslink.supervisor.application.dto;

import com.ucebuslink.shared.constant.ScheduleType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

public record ScheduleDetailCommand(
    @NotNull(message = "El tipo de horario es obligatorio")
    ScheduleType type,

    @NotEmpty(message = "Debe especificar al menos un día de la semana")
    Set<DayOfWeek> daysOfWeek,

    List<LocalTime> fixedDepartureTimes,
    LocalTime frequencyStartTime,
    LocalTime frequencyEndTime,
    Integer frequencyIntervalMinutes
) {}