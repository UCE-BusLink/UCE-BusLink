package com.ucebuslink.supervisor.infrastructure.persistence.repository;

import com.ucebuslink.supervisor.domain.repository.ScheduleRepository;
import com.ucebuslink.supervisor.domain.model.Schedule;
import com.ucebuslink.supervisor.infrastructure.persistence.entity.ScheduleJpaEntity;
import com.ucebuslink.supervisor.infrastructure.persistence.entity.RouteJpaEntity;
import com.ucebuslink.supervisor.infrastructure.persistence.mapper.SupervisorMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ScheduleRepositoryAdapter implements ScheduleRepository {

    private final SpringDataScheduleRepository springDataScheduleRepository;
    private final SpringDataRouteRepository springDataRouteRepository; 
    private final SupervisorMapper mapper;

    @Override
    public Schedule save(Schedule schedule) {
        RouteJpaEntity routeEntity = springDataRouteRepository.findById(schedule.getRouteId())
                .orElseThrow(() -> new IllegalArgumentException("Route not found with ID: " + schedule.getRouteId()));
        
        ScheduleJpaEntity jpaEntity = mapper.toEntity(schedule, routeEntity);
        ScheduleJpaEntity savedEntity = springDataScheduleRepository.save(jpaEntity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Schedule> findById(UUID id) {
        return springDataScheduleRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Schedule> findByRouteId(UUID routeId) {
        return springDataScheduleRepository.findByRouteId(routeId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(UUID id) {
        springDataScheduleRepository.deleteById(id);
    }

    @Override
    public List<Schedule> saveAll(List<Schedule> schedules) {
        // Map the domain list to JPA entities
        List<ScheduleJpaEntity> entitiesToSave = schedules.stream().map(schedule -> {
            RouteJpaEntity routeEntity = springDataRouteRepository.findById(schedule.getRouteId())
                    .orElseThrow(() -> new IllegalArgumentException("Route not found with ID: " + schedule.getRouteId()));
            return mapper.toEntity(schedule, routeEntity);
        }).collect(Collectors.toList());

        // Save the whole batch in a single database operation
        List<ScheduleJpaEntity> savedEntities = springDataScheduleRepository.saveAll(entitiesToSave);

        // Return mapped back to the domain
        return savedEntities.stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}