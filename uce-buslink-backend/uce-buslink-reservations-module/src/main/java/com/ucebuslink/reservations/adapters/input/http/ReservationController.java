package com.ucebuslink.reservations.adapters.input.http;

import com.ucebuslink.reservations.application.dto.CreateReservationCommand;
import com.ucebuslink.reservations.application.dto.CreateReservationRequest;
import com.ucebuslink.reservations.application.dto.ReservationResponse;
import com.ucebuslink.reservations.application.service.ReservationApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationApplicationService reservationApplicationService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('USER')")
    public ResponseEntity<ReservationResponse> createReservation(
            @Valid @RequestBody CreateReservationRequest request,
            Authentication authentication) {

        UUID userId = (UUID) authentication.getDetails();

        CreateReservationCommand command =
                new CreateReservationCommand(
                        request.tripId(),
                        request.seatId(),
                        request.boardingStopId(),
                        userId
                );

        ReservationResponse response =
                reservationApplicationService.reserveSeat(command);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}