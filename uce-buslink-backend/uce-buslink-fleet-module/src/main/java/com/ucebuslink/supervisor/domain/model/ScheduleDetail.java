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
            throw new IllegalArgumentException("El tipo de horario es obligatorio.");
        }

        if (daysOfWeek.isEmpty()) {
            throw new IllegalArgumentException(
                    "Debe especificarse al menos un día de operación."
            );
        }

        switch (type) {
            case FIXED -> validateFixedSchedule();
            case FREQUENCY -> validateFrequencySchedule();
            default -> throw new IllegalArgumentException(
                    "Tipo de horario no soportado: " + type
            );
        }
    }

    private void validateFixedSchedule() {
        if (fixedDepartureTimes == null || fixedDepartureTimes.isEmpty()) {
            throw new IllegalArgumentException(
                    "Los horarios fijos requieren al menos una hora de salida."
            );
        }

        if (frequencyStartTime != null
                || frequencyEndTime != null
                || frequencyIntervalMinutes != null) {
            throw new IllegalArgumentException(
                    "Un horario FIXED no debe contener datos de frecuencia."
            );
        }
    }

    private void validateFrequencySchedule() {
        if (frequencyStartTime == null) {
            throw new IllegalArgumentException(
                    "La hora de inicio es obligatoria para horarios por frecuencia."
            );
        }

        if (frequencyEndTime == null) {
            throw new IllegalArgumentException(
                    "La hora de fin es obligatoria para horarios por frecuencia."
            );
        }

        if (frequencyIntervalMinutes == null) {
            throw new IllegalArgumentException(
                    "El intervalo de frecuencia es obligatorio."
            );
        }

        if (!frequencyStartTime.isBefore(frequencyEndTime)) {
            throw new IllegalArgumentException(
                    "La hora de inicio debe ser anterior a la hora de fin."
            );
        }

        if (frequencyIntervalMinutes <= 0) {
            throw new IllegalArgumentException(
                    "El intervalo debe ser mayor que cero."
            );
        }

        if (!fixedDepartureTimes.isEmpty()) {
            throw new IllegalArgumentException(
                    "Un horario FREQUENCY no debe contener horas fijas."
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