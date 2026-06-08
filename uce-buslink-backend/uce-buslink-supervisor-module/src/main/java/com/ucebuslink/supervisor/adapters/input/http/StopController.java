package com.ucebuslink.supervisor.adapters.input.http;

import com.ucebuslink.supervisor.application.dto.CreateStopCommand;
import com.ucebuslink.supervisor.application.dto.StopResponse;
import com.ucebuslink.supervisor.application.dto.UpdateStopCommand;
import com.ucebuslink.supervisor.application.usecase.ManageStopUseCase;

import jakarta.validation.Valid;

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

    private final ManageStopUseCase manageStopUseCase;

    public StopController(ManageStopUseCase manageStopUseCase) {
        this.manageStopUseCase = manageStopUseCase;
    }

    @PostMapping
    public ResponseEntity<StopResponse> createStop(@Valid @RequestBody CreateStopCommand command) {
        StopResponse response = manageStopUseCase.createStop(command);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<StopResponse>> getAllStops() {
        return ResponseEntity.ok(manageStopUseCase.getAllActiveStops());
    }

    @PutMapping("/{id}")
    public ResponseEntity<StopResponse> updateStop(@PathVariable UUID id, @Valid @RequestBody UpdateStopCommand command) {
        return ResponseEntity.ok(manageStopUseCase.updateStop(id, command));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStop(@PathVariable UUID id) {
        manageStopUseCase.deleteStop(id);
        return ResponseEntity.noContent().build();
    }
}