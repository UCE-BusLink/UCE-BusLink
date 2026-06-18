package com.ucebuslink.supervisor.adapters.input.http;

import com.ucebuslink.supervisor.application.dto.CreateStopCommand;
import com.ucebuslink.supervisor.application.dto.StopResponse;
import com.ucebuslink.supervisor.application.dto.UpdateStopCommand;
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
@PreAuthorize("hasRole('ADMIN')")
public class StopController {

    private static final Logger log = LoggerFactory.getLogger(StopController.class);
    private final ManageStopUseCase manageStopUseCase;

    public StopController(ManageStopUseCase manageStopUseCase) {
        this.manageStopUseCase = manageStopUseCase;
    }

    @PostMapping
    public ResponseEntity<StopResponse> createStop(@Valid @RequestBody CreateStopCommand command) {
        log.info("[FLEET] Creating new stop..."); // Si el command tiene un campo nombre, podrías poner command.name()
        StopResponse response = manageStopUseCase.createStop(command);
        log.info("[FLEET] Stop created successfully with ID: {}", response.id());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<StopResponse>> getAllStops() {
        log.debug("[FLEET] Fetching all active stops");
        return ResponseEntity.ok(manageStopUseCase.getAllActiveStops());
    }

    @PutMapping("/{id}")
    public ResponseEntity<StopResponse> updateStop(@PathVariable UUID id, @Valid @RequestBody UpdateStopCommand command) {
        log.info("[FLEET] Updating stop info for ID: {}", id);
        return ResponseEntity.ok(manageStopUseCase.updateStop(id, command));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStop(@PathVariable UUID id) {
        log.info("[FLEET] Request to delete stop with ID: {}", id);
        manageStopUseCase.deleteStop(id);
        log.info("[FLEET] Stop with ID {} deleted successfully", id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/batch")
    public ResponseEntity<List<StopResponse>> createStopsBatch(@Valid @RequestBody List<CreateStopCommand> commands) {
        log.info("[FLEET] Creating a batch of {} new stops...", commands.size());
        List<StopResponse> responses = manageStopUseCase.createStopsBatch(commands);
        log.info("[FLEET] Batch of {} stops created successfully", responses.size());
        return new ResponseEntity<>(responses, HttpStatus.CREATED);
    }
}