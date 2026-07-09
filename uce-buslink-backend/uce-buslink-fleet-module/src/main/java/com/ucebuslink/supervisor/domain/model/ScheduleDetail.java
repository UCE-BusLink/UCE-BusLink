package com.ucebuslink.supervisor.domain.model;

import com.ucebuslink.shared.constant.ScheduleType;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Set;

public class ScheduleDetail {

    private final ScheduleType type;
    private final Set<DayOfWeek> daysOfWeek;
    private final List<LocalTime> fixedDepartureTimes;
    private final LocalTime frequencyStartTime;
    private final LocalTime frequencyEndTime;
    private final Integer frequencyIntervalMinutes;

    public ScheduleDetail(
            ScheduleType type,
            Set<DayOfWeek> daysOfWeek,
            List<LocalTime> fixedDepartureTimes,
            LocalTime frequencyStartTime,
            LocalTime frequencyEndTime,
            Integer frequencyIntervalMinutes
    ) {
        this.type = type;
        this.daysOfWeek = daysOfWeek != null
                ? Set.copyOf(daysOfWeek)
                : Collections.emptySet();

        this.fixedDepartureTimes = fixedDepartureTimes != null
                ? List.copyOf(fixedDepartureTimes)
                : Collections.emptyList();

        this.frequencyStartTime = frequencyStartTime;
        this.frequencyEndTime = frequencyEndTime;
        this.frequencyIntervalMinutes = frequencyIntervalMinutes;

        validate();
    }

    private void validate() {
        if (type == null) {
            throw new IllegalArgumentException("The schedule type is required.");
        }

        if (daysOfWeek.isEmpty()) {
            throw new IllegalArgumentException(
                    "At least one operating day must be specified."
            );
        }

        switch (type) {
            case FIXED -> validateFixedSchedule();
            case FREQUENCY -> validateFrequencySchedule();
            default -> throw new IllegalArgumentException(
                    "Unsupported schedule type: " + type
            );
        }
    }

    private void validateFixedSchedule() {
        if (fixedDepartureTimes == null || fixedDepartureTimes.isEmpty()) {
            throw new IllegalArgumentException(
                    "Fixed schedules require at least one departure time."
            );
        }

        if (frequencyStartTime != null
                || frequencyEndTime != null
                || frequencyIntervalMinutes != null) {
            throw new IllegalArgumentException(
                    "A FIXED schedule must not contain frequency data."
            );
        }
    }

    private void validateFrequencySchedule() {
        if (frequencyStartTime == null) {
            throw new IllegalArgumentException(
                    "The start time is required for frequency-based schedules."
            );
        }

        if (frequencyEndTime == null) {
            throw new IllegalArgumentException(
                    "The end time is required for frequency-based schedules."
            );
        }

        if (frequencyIntervalMinutes == null) {
            throw new IllegalArgumentException(
                    "The frequency interval is required."
            );
        }

        if (!frequencyStartTime.isBefore(frequencyEndTime)) {
            throw new IllegalArgumentException(
                    "The start time must be before the end time."
            );
        }

        if (frequencyIntervalMinutes <= 0) {
            throw new IllegalArgumentException(
                    "The interval must be greater than zero."
            );
        }

        if (!fixedDepartureTimes.isEmpty()) {
            throw new IllegalArgumentException(
                    "A FREQUENCY schedule must not contain fixed times."
            );
        }
    }

    public ScheduleType getType() {
        return type;
    }

    public Set<DayOfWeek> getDaysOfWeek() {
        return daysOfWeek;
    }

    public List<LocalTime> getFixedDepartureTimes() {
        return fixedDepartureTimes;
    }

    public LocalTime getFrequencyStartTime() {
        return frequencyStartTime;
    }

    public LocalTime getFrequencyEndTime() {
        return frequencyEndTime;
    }

    public Integer getFrequencyIntervalMinutes() {
        return frequencyIntervalMinutes;
    }

    public boolean isFixedSchedule() {
        return ScheduleType.FIXED.equals(type);
    }

    public boolean isFrequencySchedule() {
        return ScheduleType.FREQUENCY.equals(type);
    }

    @Override
    public String toString() {
        return "ScheduleDetail{" +
                "type=" + type +
                ", daysOfWeek=" + daysOfWeek +
                ", fixedDepartureTimes=" + fixedDepartureTimes +
                ", frequencyStartTime=" + frequencyStartTime +
                ", frequencyEndTime=" + frequencyEndTime +
                ", frequencyIntervalMinutes=" + frequencyIntervalMinutes +
                '}';
    }
}