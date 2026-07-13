package com.ucebuslink.supervisor.adapters.input.http;

import com.ucebuslink.shared.dto.BatchResult;
import com.ucebuslink.supervisor.application.dto.schedule.CreateScheduleCommand;
import com.ucebuslink.supervisor.application.dto.schedule.ScheduleResponse;
import com.ucebuslink.supervisor.application.dto.schedule.UpdateScheduleCommand;
import com.ucebuslink.supervisor.application.usecase.ManageScheduleUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/supervisor/fleet/schedules")
@Slf4j
@RequiredArgsConstructor
public class ScheduleController {

    private final ManageScheduleUseCase manageScheduleUseCase;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ScheduleResponse> createSchedule(@Valid @RequestBody CreateScheduleCommand command) {
        log.info("[FLEET] Creating new schedule for route ID: {}", command.routeId());
        ScheduleResponse response = manageScheduleUseCase.create(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/route/{routeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ScheduleResponse>> getSchedulesByRoute(@PathVariable UUID routeId) {
        log.info("[FLEET] Fetching schedules for route ID: {}", routeId);
        List<ScheduleResponse> schedules = manageScheduleUseCase.findByRouteId(routeId);
        return ResponseEntity.ok(schedules);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ScheduleResponse> updateSchedule(
            @PathVariable UUID id, 
            @Valid @RequestBody UpdateScheduleCommand command) {
        log.info("[FLEET] Updating schedule with ID: {}", id);
        ScheduleResponse response = manageScheduleUseCase.update(id, command);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSchedule(@PathVariable UUID id) {
        log.info("[FLEET] Deleting schedule with ID: {}", id);
        manageScheduleUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BatchResult<ScheduleResponse>> createSchedulesBatch(@RequestBody List<CreateScheduleCommand> commands) {
        log.info("[FLEET] Received batch request with {} schedules", commands.size());

        BatchResult<ScheduleResponse> result = manageScheduleUseCase.createBatch(commands);

        log.info("[FLEET] Batch schedule request processed: {} succeeded, {} failed",
                result.successCount(), result.failureCount());

        HttpStatus status = result.failureCount() == 0 ? HttpStatus.CREATED : HttpStatus.MULTI_STATUS;
        return new ResponseEntity<>(result, status);
    }
}