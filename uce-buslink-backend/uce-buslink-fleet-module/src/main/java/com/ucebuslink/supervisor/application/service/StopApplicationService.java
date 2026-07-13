package com.ucebuslink.supervisor.application.service;

import com.ucebuslink.shared.dto.BatchItemError;
import com.ucebuslink.shared.dto.BatchResult;
import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.application.dto.stop.ChangeStopStatusCommand;
import com.ucebuslink.supervisor.application.dto.stop.CreateStopCommand;
import com.ucebuslink.supervisor.application.dto.stop.StopResponse;
import com.ucebuslink.supervisor.application.dto.stop.UpdateStopCommand;
import com.ucebuslink.supervisor.application.usecase.ManageStopUseCase;
import com.ucebuslink.supervisor.domain.model.Stop;
import com.ucebuslink.supervisor.domain.repository.RouteRepository;
import com.ucebuslink.supervisor.domain.repository.StopRepository;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StopApplicationService implements ManageStopUseCase {

    private static final Logger log = LoggerFactory.getLogger(StopApplicationService.class);

    private final StopRepository stopRepository;
    private final RouteRepository routeRepository;
    private final Validator validator;
    private final TransactionTemplate requiresNewTransactionTemplate;

    public StopApplicationService(StopRepository stopRepository,
                                   RouteRepository routeRepository,
                                   Validator validator,
                                   PlatformTransactionManager transactionManager) {
        this.stopRepository = stopRepository;
        this.routeRepository = routeRepository;
        this.validator = validator;
        this.requiresNewTransactionTemplate = new TransactionTemplate(transactionManager);
        // Each batch item commits (or rolls back) on its own, so one bad item
        // never discards the items that were already saved successfully.
        this.requiresNewTransactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    @Override
    @Transactional
    public StopResponse createStop(CreateStopCommand command) {
        return mapToResponse(persistStop(command));
    }

    private Stop persistStop(CreateStopCommand command) {
        Stop stop = new Stop();
        stop.setName(command.name());
        stop.setLatitude(command.latitude());
        stop.setLongitude(command.longitude());
        stop.setIsActive(true);
        stop.setCreatedAt(LocalDateTime.now());

        return stopRepository.save(stop);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StopResponse> getAllActiveStops() {
        return stopRepository.findAllActive().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private StopResponse mapToResponse(Stop stop) {
        return new StopResponse(
                stop.getId(),
                stop.getName(),
                stop.getLatitude(),
                stop.getLongitude(),
                stop.getIsActive()
        );
    }

    @Override
    @Transactional
    public StopResponse updateStop(UUID id, UpdateStopCommand command) {
        Stop stop = stopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stop not found with id: " + id));

        stop.setName(command.name());
        stop.setLatitude(command.latitude());
        stop.setLongitude(command.longitude());

        return mapToResponse(stopRepository.save(stop));
    }

    @Override
    @Transactional
    public void deleteStop(UUID id) {

        Stop stop = stopRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Stop not found with id: " + id));

        stop.setIsActive(false);
        stop.setDeletedAt(LocalDateTime.now());

        stopRepository.save(stop);

        routeRepository.removeStopFromRoutes(id);
    }

    @Override
    public BatchResult<StopResponse> createStopsBatch(List<CreateStopCommand> commands) {
        List<StopResponse> succeeded = new ArrayList<>();
        List<BatchItemError> failed = new ArrayList<>();

        for (int index = 0; index < commands.size(); index++) {
            CreateStopCommand command = commands.get(index);

            Set<ConstraintViolation<CreateStopCommand>> violations = validator.validate(command);
            if (!violations.isEmpty()) {
                Map<String, String> fieldErrors = toFieldErrors(violations);
                log.warn("[FLEET] Batch stop at index {} rejected due to validation errors: {}", index, fieldErrors);
                failed.add(new BatchItemError(index, "Validation failed", fieldErrors));
                continue;
            }

            try {
                Stop savedStop = requiresNewTransactionTemplate.execute(status -> persistStop(command));
                succeeded.add(mapToResponse(savedStop));
            } catch (Exception ex) {
                log.error("[FLEET] Batch stop at index {} could not be persisted: {}", index, ex.getMessage());
                failed.add(new BatchItemError(index, ex.getMessage(), null));
            }
        }

        log.info("[FLEET] Batch stop creation finished: {} succeeded, {} failed out of {} received",
                succeeded.size(), failed.size(), commands.size());

        return BatchResult.of(succeeded, failed, commands.size());
    }

    private Map<String, String> toFieldErrors(Set<ConstraintViolation<CreateStopCommand>> violations) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (ConstraintViolation<CreateStopCommand> violation : violations) {
            fieldErrors.put(violation.getPropertyPath().toString(), violation.getMessage());
        }
        return fieldErrors;
    }

    @Override
    public PageResponse<StopResponse> getAllStops(boolean isActive, int page, int size){

        PageResponse<Stop> domainPage = stopRepository.findAllStops(isActive, page, size);

        List<StopResponse> Dto = domainPage.content().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(Dto, domainPage.pageNumber(), domainPage.pageSize(), domainPage.totalElements(), domainPage.totalPages());
    }

    @Override
    public StopResponse changeStatus(UUID id, ChangeStopStatusCommand command) {

        Stop stop = stopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stop not found"));

        stop.setIsActive(command.isActive());

        stopRepository.save(stop);

        return mapToResponse(stop);
    }
}