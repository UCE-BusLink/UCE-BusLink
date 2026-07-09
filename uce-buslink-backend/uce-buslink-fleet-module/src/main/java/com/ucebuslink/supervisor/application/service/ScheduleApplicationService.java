package com.ucebuslink.supervisor.application.service;

import com.ucebuslink.shared.dto.BatchItemError;
import com.ucebuslink.shared.dto.BatchResult;
import com.ucebuslink.supervisor.application.dto.schedule.CreateScheduleCommand;
import com.ucebuslink.supervisor.application.dto.schedule.ScheduleDetailCommand;
import com.ucebuslink.supervisor.application.dto.schedule.ScheduleDetailResponse;
import com.ucebuslink.supervisor.application.dto.schedule.ScheduleResponse;
import com.ucebuslink.supervisor.application.dto.schedule.UpdateScheduleCommand;
import com.ucebuslink.supervisor.application.usecase.ManageScheduleUseCase;
import com.ucebuslink.supervisor.domain.model.Schedule;
import com.ucebuslink.supervisor.domain.model.ScheduleDetail;
import com.ucebuslink.supervisor.domain.repository.ScheduleRepository;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ScheduleApplicationService implements ManageScheduleUseCase {

    private final ScheduleRepository scheduleRepository;
    private final Validator validator;
    private final TransactionTemplate requiresNewTransactionTemplate;

    public ScheduleApplicationService(ScheduleRepository scheduleRepository,
                                       Validator validator,
                                       PlatformTransactionManager transactionManager) {
        this.scheduleRepository = scheduleRepository;
        this.validator = validator;
        this.requiresNewTransactionTemplate = new TransactionTemplate(transactionManager);
        // Each batch item commits (or rolls back) on its own, so one bad item
        // never discards the items that were already saved successfully.
        this.requiresNewTransactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    @Override
    @Transactional
    public ScheduleResponse create(CreateScheduleCommand command) {
        return toResponse(persistSchedule(command));
    }

    private Schedule persistSchedule(CreateScheduleCommand command) {
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

        return savedSchedule;
    }

    @Override
    public BatchResult<ScheduleResponse> createBatch(List<CreateScheduleCommand> commands) {
        List<ScheduleResponse> succeeded = new ArrayList<>();
        List<BatchItemError> failed = new ArrayList<>();

        for (int index = 0; index < commands.size(); index++) {
            CreateScheduleCommand command = commands.get(index);

            Set<ConstraintViolation<CreateScheduleCommand>> violations = validator.validate(command);
            if (!violations.isEmpty()) {
                Map<String, String> fieldErrors = toFieldErrors(violations);
                log.warn("[FLEET] Batch schedule at index {} rejected due to validation errors: {}", index, fieldErrors);
                failed.add(new BatchItemError(index, "Validation failed", fieldErrors));
                continue;
            }

            try {
                Schedule savedSchedule = requiresNewTransactionTemplate.execute(status -> persistSchedule(command));
                succeeded.add(toResponse(savedSchedule));
            } catch (Exception ex) {
                log.error("[FLEET] Batch schedule at index {} could not be persisted: {}", index, ex.getMessage());
                failed.add(new BatchItemError(index, ex.getMessage(), null));
            }
        }

        log.info("[FLEET] Batch schedule creation finished: {} succeeded, {} failed out of {} received",
                succeeded.size(), failed.size(), commands.size());

        return BatchResult.of(succeeded, failed, commands.size());
    }

    private Map<String, String> toFieldErrors(Set<ConstraintViolation<CreateScheduleCommand>> violations) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (ConstraintViolation<CreateScheduleCommand> violation : violations) {
            fieldErrors.put(violation.getPropertyPath().toString(), violation.getMessage());
        }
        return fieldErrors;
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
                .orElseThrow(() -> new RuntimeException("Schedule not found with ID: " + id));

        List<ScheduleDetail> updatedDetails = command.details().stream()
                .map(this::mapToDetailDomain)
                .collect(Collectors.toList());

        Schedule updatedSchedule = new Schedule(
                existingSchedule.getId(),
                existingSchedule.getRouteId(),
                updatedDetails,
                command.active()
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
                .orElseThrow(() -> new RuntimeException("Schedule not found with ID: " + id));
        
        scheduleRepository.deleteById(id);
        log.info("[FLEET] Schedule successfully deleted with ID: {}", id);
    }

    // --- Private helper methods ---

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