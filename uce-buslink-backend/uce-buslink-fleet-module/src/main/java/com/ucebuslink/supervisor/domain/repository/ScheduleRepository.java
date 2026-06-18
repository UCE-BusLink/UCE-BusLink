package com.ucebuslink.supervisor.domain.repository;

import com.ucebuslink.supervisor.domain.model.Schedule;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScheduleRepository {
    Schedule save(Schedule schedule);
    Optional<Schedule> findById(UUID id);
    List<Schedule> findByRouteId(UUID routeId);
    void deleteById(UUID id);

    List<Schedule> saveAll(List<Schedule> schedules);
}