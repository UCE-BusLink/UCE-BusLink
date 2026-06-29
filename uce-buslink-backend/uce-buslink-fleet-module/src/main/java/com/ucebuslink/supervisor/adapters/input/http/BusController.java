package com.ucebuslink.supervisor.adapters.input.http;

import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.application.dto.bus.BusResponse;
import com.ucebuslink.supervisor.application.dto.bus.ChangeBusStatusCommand;
import com.ucebuslink.supervisor.application.dto.bus.CreateBusCommand;
import com.ucebuslink.supervisor.application.dto.bus.UpdateBusCommand;
import com.ucebuslink.supervisor.application.usecase.ManageBusUseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/supervisor/fleet/buses")
public class BusController {

    private static final Logger log = LoggerFactory.getLogger(BusController.class);
    private final ManageBusUseCase manageBusUseCase;

    public BusController(ManageBusUseCase manageBusUseCase) {
        this.manageBusUseCase = manageBusUseCase;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BusResponse> createBus(@Valid @RequestBody CreateBusCommand command) {
        log.info("[FLEET] Creating new bus with plate: {}", command.plateNumber());
        BusResponse response = manageBusUseCase.createBus(command);
        log.info("[FLEET] Bus created successfully with ID: {}", response.id());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
   
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PageResponse<BusResponse>> getAllBusesActive(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.debug("[FLEET] Fetching paginated bus list (page: {}, size: {})", page, size);
        return ResponseEntity.ok(manageBusUseCase.getAllActiveBuses(page, size));
    }

    @GetMapping("/buses")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PageResponse<BusResponse>> getAllBuses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.debug("[FLEET] Fetching paginated bus list (page: {}, size: {})", page, size);
        return ResponseEntity.ok(manageBusUseCase.findAll(page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BusResponse> getBusById(@PathVariable(name = "id") UUID id) {
        log.debug("[FLEET] Fetching bus by ID: {}", id);
        return ResponseEntity.ok(manageBusUseCase.getBusById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBus(@PathVariable(name = "id") UUID id) {
        log.info("[FLEET] Request to delete bus with ID: {}", id);
        manageBusUseCase.deleteBus(id);
        log.info("[FLEET] Bus with ID {} deleted successfully", id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BusResponse> updateBus(@PathVariable UUID id, @Valid @RequestBody UpdateBusCommand command) {
        log.info("[FLEET] Updating bus info for ID: {}", id);
        return ResponseEntity.ok(manageBusUseCase.updateBus(id, command));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BusResponse> changeBusStatus(@PathVariable UUID id, @Valid @RequestBody ChangeBusStatusCommand command) {
        log.info("[FLEET] Changing bus {} status to: {}", id, command.status());
        return ResponseEntity.ok(manageBusUseCase.changeBusStatus(id, command));
    }
}