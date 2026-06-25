package com.ucebuslink.supervisor.adapters.input.http;

import com.ucebuslink.supervisor.application.dto.trip.TripResponse;
import com.ucebuslink.supervisor.application.usecase.ManageTripUseCase; // O un caso de uso específico para el chofer
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/driver/trips")
@RequiredArgsConstructor
public class DriverTripController {

    // Nota: Puedes usar tu ManageTripUseCase existente o crear un DriverTripUseCase dedicado.
    private final ManageTripUseCase manageTripUseCase;

    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    public ResponseEntity<Page<TripResponse>> getTodayTrips(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
            
        UUID driverId = (UUID) authentication.getDetails();
        LocalDate today = LocalDate.now();
        
        log.info("[REST-DRIVER] Solicitud GET recibida para listar viajes del día. DriverID: {}, Fecha: {}, Page: {}, Size: {}", 
                driverId, today, page, size);
        
        Page<TripResponse> response = manageTripUseCase.getTripsByDriverAndDate(driverId, today, page, size);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    public ResponseEntity<Page<TripResponse>> getAllTrips(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
            
        UUID driverId = (UUID) authentication.getDetails();
        
        log.info("[REST-DRIVER] Solicitud GET recibida para historial completo de viajes. DriverID: {}, Page: {}, Size: {}", 
                driverId, page, size);
        
        Page<TripResponse> response = manageTripUseCase.getTripsByDriverId(driverId, page, size);
        
        return ResponseEntity.ok(response);
    }
}