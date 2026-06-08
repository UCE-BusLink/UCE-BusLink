package com.ucebuslink.supervisor.adapters.input.http;

import com.ucebuslink.supervisor.application.dto.BusResponse;
import com.ucebuslink.supervisor.application.dto.CreateBusCommand;
import com.ucebuslink.supervisor.application.usecase.ManageBusUseCase;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/supervisor/fleet/buses")
@PreAuthorize("hasRole('ADMIN')") // Protegido: Solo administradores
public class BusController {

    private final ManageBusUseCase manageBusUseCase;

    public BusController(ManageBusUseCase manageBusUseCase) {
        this.manageBusUseCase = manageBusUseCase;
    }

    @PostMapping
    public ResponseEntity<BusResponse> createBus(@Valid @RequestBody CreateBusCommand command) {
        BusResponse response = manageBusUseCase.createBus(command);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BusResponse>> getAllBuses() {
        return ResponseEntity.ok(manageBusUseCase.getAllActiveBuses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusResponse> getBusById(@PathVariable(name = "id") UUID id) {
        return ResponseEntity.ok(manageBusUseCase.getBusById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBus(@PathVariable(name = "id") UUID id) {
        manageBusUseCase.deleteBus(id);
        return ResponseEntity.noContent().build();
    }
}