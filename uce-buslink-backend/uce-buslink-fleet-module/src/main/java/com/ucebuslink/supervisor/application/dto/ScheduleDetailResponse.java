package com.ucebuslink.supervisor.application.dto;

import com.ucebuslink.shared.constant.ScheduleType;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

public record ScheduleDetailResponse(
    ScheduleType type,
    Set<DayOfWeek> daysOfWeek,
    List<LocalTime> fixedDepartureTimes,
    LocalTime frequencyStartTime,
    LocalTime frequencyEndTime,
    Integer frequencyIntervalMinutes
) {}