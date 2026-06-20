package com.ucebuslink.supervisor.adapters.input.http;

import com.ucebuslink.supervisor.application.dto.trip.CreateTripCommand;
import com.ucebuslink.supervisor.application.dto.trip.TripResponse;
import com.ucebuslink.supervisor.application.usecase.ManageTripUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/supervisor/trips")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class TripController {

    private final ManageTripUseCase manageTripUseCase;

    @PostMapping
    public ResponseEntity<java.util.List<TripResponse>> createTrip(@Valid @RequestBody CreateTripCommand command) {
        log.debug("[REST-FLEET] Solicitud POST recibida para planificar viajes.");
        java.util.List<TripResponse> response = manageTripUseCase.createTrip(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}