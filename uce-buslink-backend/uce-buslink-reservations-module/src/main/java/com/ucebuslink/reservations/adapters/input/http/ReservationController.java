package com.ucebuslink.reservations.adapters.input.http;

import com.ucebuslink.reservations.application.dto.CancelReservationCommand;
import com.ucebuslink.reservations.application.dto.CancelReservationRequest;
import com.ucebuslink.reservations.application.dto.CreateReservationCommand;
import com.ucebuslink.reservations.application.dto.CreateReservationRequest;
import com.ucebuslink.reservations.application.dto.ReservationResponse;
import com.ucebuslink.reservations.application.service.ReservationApplicationService;
import com.ucebuslink.shared.constant.ReservationStatus;
import com.ucebuslink.shared.security.CurrentUserProvider;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.data.domain.Page;
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

        UUID userId = CurrentUserProvider.requireUserId(authentication);

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

    @GetMapping("/my-history")
    @PreAuthorize("hasRole('STUDENT') or hasRole('USER')")
    public ResponseEntity<Page<ReservationResponse>> getMyReservations(
            @RequestParam(name = "status", required = false) ReservationStatus status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            Authentication authentication) {
        
        UUID userId = CurrentUserProvider.requireUserId(authentication);
        log.debug("[REST-RESERVATIONS] GET history request for user: {} with status filter: {}", userId, status);
        
        return ResponseEntity.ok(reservationApplicationService.getUserReservations(userId, status, page, size));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('STUDENT') or hasRole('USER')")
    public ResponseEntity<Void> cancelReservation(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CancelReservationRequest request,
            Authentication authentication) {
        
        UUID userId = CurrentUserProvider.requireUserId(authentication);

        CancelReservationCommand command =
                new CancelReservationCommand(
                        userId,
                        request.reason()
                );

        log.debug("[REST-RESERVATIONS] PATCH safe cancellation request for reservation ID: {}", id);
        
        reservationApplicationService.cancelReservation(id, command);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/admin-cancel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DRIVER')")
    public ResponseEntity<Void> cancelReservationByAdmin(
            @PathVariable("id") UUID id,
            @RequestBody(required = false) CancelReservationCommand command) {
        
        log.debug("[REST-RESERVATIONS] PATCH administrative cancellation request for reservation ID: {}", id);
        CancelReservationCommand safeCommand = command != null ? command : new CancelReservationCommand(id, "Administrative cancellation with no reason specified");
        
        reservationApplicationService.cancelReservationByAdmin(id, safeCommand);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/scan")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DRIVER')")
    public ResponseEntity<ReservationResponse> scanReservation(@PathVariable("id") String id) {
        log.debug("[REST-RESERVATIONS] PATCH request to mark scan (COMPLETED) for reservation ID: {}", id);
        UUID reservationId = UUID.fromString(id);
        return ResponseEntity.ok(reservationApplicationService.scanAndCompleteReservation(reservationId));
    }
}