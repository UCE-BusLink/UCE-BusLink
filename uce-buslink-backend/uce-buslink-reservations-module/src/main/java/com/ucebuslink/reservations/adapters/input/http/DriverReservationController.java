package com.ucebuslink.reservations.adapters.input.http;

import com.ucebuslink.reservations.application.dto.DriverPassengerResponse;
import com.ucebuslink.reservations.application.service.ReservationApplicationService;
import com.ucebuslink.shared.security.CurrentUserProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/driver/trips")
@RequiredArgsConstructor
public class DriverReservationController {

    private final ReservationApplicationService reservationApplicationService;

    @GetMapping("/{tripId}/reservations")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    public ResponseEntity<Page<DriverPassengerResponse>> getTripReservations(
            @PathVariable("tripId") UUID tripId, 
            Authentication authentication,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
            
        UUID driverId = CurrentUserProvider.requireUserId(authentication);
        
        log.info("[REST-DRIVER] GET request received to list passengers. TripID: {}, DriverID: {}, Page: {}, Size: {}",
                tripId, driverId, page, size);
        
        Page<DriverPassengerResponse> response = reservationApplicationService.getReservationsByTripForDriver(tripId, driverId, page, size);
        
        return ResponseEntity.ok(response);
    }
}