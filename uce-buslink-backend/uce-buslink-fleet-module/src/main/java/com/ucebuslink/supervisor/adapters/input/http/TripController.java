package com.ucebuslink.supervisor.adapters.input.http;

import com.ucebuslink.shared.constant.TripState;
import com.ucebuslink.supervisor.application.dto.trip.ChangeTripStateCommand;
import com.ucebuslink.supervisor.application.dto.trip.CreateTripCommand;
import com.ucebuslink.supervisor.application.dto.trip.TripResponse;
import com.ucebuslink.supervisor.application.dto.trip.UpdateTripCommand;
import com.ucebuslink.supervisor.application.usecase.ManageTripUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/supervisor/trips")
@RequiredArgsConstructor
public class TripController {

    private final ManageTripUseCase manageTripUseCase;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<TripResponse>> createTrip(@Valid @RequestBody CreateTripCommand command) {
        log.debug("[REST-FLEET] POST request received to schedule trips.");
        java.util.List<TripResponse> response = manageTripUseCase.createTrip(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<TripResponse>> getTrips(
            @RequestParam(required = false) TripState state,
            @RequestParam(required = false) java.util.UUID routeId,
            @RequestParam(required = false) java.util.UUID driverId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.debug("[REST-FLEET] GET request to list trips with filters (State: {}, Route: {}, Driver: {}, Page: {}, Size: {}).",
                state, routeId, driverId, page, size);

        // Routing logic based on the parameters present
        if (state != null) {
            return ResponseEntity.ok(manageTripUseCase.getTripsByState(state, page, size));
        } else if (routeId != null) {
            return ResponseEntity.ok(manageTripUseCase.getTripsByRouteId(routeId, page, size));
        } else if (driverId != null) {
            return ResponseEntity.ok(manageTripUseCase.getTripsByDriverId(driverId, page, size));
        } else {
            return ResponseEntity.ok(manageTripUseCase.getAllTrips(page, size));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TripResponse> getTripById(@PathVariable java.util.UUID id) {
        log.debug("[REST-FLEET] GET request to find trip with ID: {}", id);
        return ResponseEntity.ok(manageTripUseCase.getTripById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TripResponse> updateTrip(
            @PathVariable java.util.UUID id,
            @Valid @RequestBody UpdateTripCommand command) {
        log.debug("[REST-FLEET] PUT request to update trip ID: {}", id);
        return ResponseEntity.ok(manageTripUseCase.updateTrip(id, command));
    }

    @PatchMapping("/{id}/state")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<TripResponse> changeTripState(
            @PathVariable java.util.UUID id,
            @Valid @RequestBody ChangeTripStateCommand command) {
        log.debug("[REST-FLEET] PATCH request to change state of trip ID: {}", id);
        return ResponseEntity.ok(manageTripUseCase.changeTripState(id, command));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> cancelTrip(@PathVariable java.util.UUID id) {
        log.debug("[REST-FLEET] DELETE request to logically cancel trip ID: {}", id);
        manageTripUseCase.cancelTrip(id);
        return ResponseEntity.noContent().build();
    }
}