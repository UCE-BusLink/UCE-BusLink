package com.ucebuslink.supervisor.adapters.input.http;

import com.ucebuslink.shared.dto.BatchResult;
import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.application.dto.stop.ChangeStopStatusCommand;
import com.ucebuslink.supervisor.application.dto.stop.CreateStopCommand;
import com.ucebuslink.supervisor.application.dto.stop.StopResponse;
import com.ucebuslink.supervisor.application.dto.stop.UpdateStopCommand;
import com.ucebuslink.supervisor.application.usecase.ManageStopUseCase;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/supervisor/fleet/stops")
public class StopController {

    private static final Logger log = LoggerFactory.getLogger(StopController.class);
    private final ManageStopUseCase manageStopUseCase;

    public StopController(ManageStopUseCase manageStopUseCase) {
        this.manageStopUseCase = manageStopUseCase;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('DRIVER')")
    public ResponseEntity<StopResponse> createStop(@Valid @RequestBody CreateStopCommand command) {
        log.info("[FLEET] Creating new stop: {}", command.name());
        StopResponse response = manageStopUseCase.createStop(command);
        log.info("[FLEET] Stop created successfully with ID: {}", response.id());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PageResponse<StopResponse>> getAllStops(
            @RequestParam(defaultValue = "true") boolean activa,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.debug("[FLEET] Fetching paginated stop list (page: {}, size: {})", page, size);
        return ResponseEntity.ok(manageStopUseCase.getAllStops(activa, page, size));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StopResponse> updateStop(@PathVariable UUID id, @Valid @RequestBody UpdateStopCommand command) {
        log.info("[FLEET] Updating stop info for ID: {}", id);
        return ResponseEntity.ok(manageStopUseCase.updateStop(id, command));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStop(@PathVariable UUID id) {
        log.info("[FLEET] Request to delete stop with ID: {}", id);
        manageStopUseCase.deleteStop(id);
        log.info("[FLEET] Stop with ID {} deleted successfully", id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BatchResult<StopResponse>> createStopsBatch(@RequestBody List<CreateStopCommand> commands) {
        log.info("[FLEET] Received batch request with {} stops", commands.size());

        BatchResult<StopResponse> result = manageStopUseCase.createStopsBatch(commands);

        log.info("[FLEET] Batch stop request processed: {} succeeded, {} failed",
                result.successCount(), result.failureCount());

        HttpStatus status = result.failureCount() == 0 ? HttpStatus.CREATED : HttpStatus.MULTI_STATUS;
        return new ResponseEntity<>(result, status);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StopResponse> changeStatus(
            @PathVariable UUID id,
            @RequestBody ChangeStopStatusCommand command) {

        return ResponseEntity.ok(
                manageStopUseCase.changeStatus(id, command)
        );
    }
}