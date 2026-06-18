package com.ucebuslink.supervisor.application.service;

import com.ucebuslink.supervisor.application.dto.*;
import com.ucebuslink.supervisor.application.usecase.ManageScheduleUseCase;
import com.ucebuslink.supervisor.domain.model.Schedule;
import com.ucebuslink.supervisor.domain.model.ScheduleDetail;
import com.ucebuslink.supervisor.domain.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ScheduleApplicationService implements ManageScheduleUseCase {

    private final ScheduleRepository scheduleRepository;

    @Override
    @Transactional
    public ScheduleResponse create(CreateScheduleCommand command) {
        log.info("[FLEET] Processing schedule creation for route ID: {}", command.routeId());
        
        List<ScheduleDetail> details = command.details().stream()
                .map(this::mapToDetailDomain)
                .collect(Collectors.toList());

        Schedule schedule = new Schedule(
                UUID.randomUUID(),
                command.routeId(),
                details,
                true
        );

        Schedule savedSchedule = scheduleRepository.save(schedule);
        log.info("[FLEET] Schedule successfully created with ID: {}", savedSchedule.getId());
        
        return toResponse(savedSchedule);
    }

    @Override
    @Transactional
    public List<ScheduleResponse> createBatch(
            List<CreateScheduleCommand> commands
    ) {
        return commands.stream()
                .map(this::create)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> findByRouteId(UUID routeId) {
        log.info("[FLEET] Retrieving schedules for route ID: {}", routeId);
        return scheduleRepository.findByRouteId(routeId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ScheduleResponse update(UUID id, UpdateScheduleCommand command) {
        log.info("[FLEET] Processing update for schedule ID: {}", id);
        
        Schedule existingSchedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Horario no encontrado con ID: " + id));

        List<ScheduleDetail> updatedDetails = command.details().stream()
                .map(this::mapToDetailDomain)
                .collect(Collectors.toList());

        Schedule updatedSchedule = new Schedule(
                existingSchedule.getId(),
                existingSchedule.getRouteId(),
                updatedDetails,
                command.isActive()
        );

        Schedule savedSchedule = scheduleRepository.save(updatedSchedule);
        log.info("[FLEET] Schedule successfully updated with ID: {}", savedSchedule.getId());
        
        return toResponse(savedSchedule);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        log.info("[FLEET] Attempting to delete schedule ID: {}", id);
        scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Horario no encontrado con ID: " + id));
        
        scheduleRepository.deleteById(id);
        log.info("[FLEET] Schedule successfully deleted with ID: {}", id);
    }

    // --- Métodos Privados Auxiliares ---

    private ScheduleDetail mapToDetailDomain(ScheduleDetailCommand detailCommand) {
        return new ScheduleDetail(
                detailCommand.type(),
                detailCommand.daysOfWeek(),
                detailCommand.fixedDepartureTimes(),
                detailCommand.frequencyStartTime(),
                detailCommand.frequencyEndTime(),
                detailCommand.frequencyIntervalMinutes()
        );
    }

    private ScheduleResponse toResponse(Schedule domain) {
        List<ScheduleDetailResponse> detailResponses = domain.getDetails().stream()
                .map(detail -> new ScheduleDetailResponse(
                        detail.getType(),
                        detail.getDaysOfWeek(),
                        detail.getFixedDepartureTimes(),
                        detail.getFrequencyStartTime(),
                        detail.getFrequencyEndTime(),
                        detail.getFrequencyIntervalMinutes()
                ))
                .collect(Collectors.toList());

        return new ScheduleResponse(
                domain.getId(),
                domain.getRouteId(),
                detailResponses,
                domain.isActive()
        );
    }
}