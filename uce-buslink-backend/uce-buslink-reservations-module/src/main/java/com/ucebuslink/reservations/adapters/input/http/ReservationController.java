package com.ucebuslink.reservations.adapters.input.http;

import com.ucebuslink.reservations.application.dto.CancelReservationCommand;
import com.ucebuslink.reservations.application.dto.CancelReservationRequest;
import com.ucebuslink.reservations.application.dto.CreateReservationCommand;
import com.ucebuslink.reservations.application.dto.CreateReservationRequest;
import com.ucebuslink.reservations.application.dto.ReservationResponse;
import com.ucebuslink.reservations.application.service.ReservationApplicationService;
import com.ucebuslink.shared.constant.ReservationStatus;

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

    @GetMapping("/my-history")
    @PreAuthorize("hasRole('STUDENT') or hasRole('USER')")
    public ResponseEntity<Page<ReservationResponse>> getMyReservations(
            @RequestParam(name = "status", required = false) ReservationStatus status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            Authentication authentication) {
        
        UUID userId = (UUID) authentication.getDetails();
        log.debug("[REST-RESERVATIONS] Solicitud GET historial para el usuario: {} con filtro estado: {}", userId, status);
        
        return ResponseEntity.ok(reservationApplicationService.getUserReservations(userId, status, page, size));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('STUDENT') or hasRole('USER')")
    public ResponseEntity<Void> cancelReservation(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CancelReservationRequest request,
            Authentication authentication) {
        
        UUID userId = (UUID) authentication.getDetails();

        CancelReservationCommand command =
                new CancelReservationCommand(
                        userId,
                        request.reason()
                );

        log.debug("[REST-RESERVATIONS] Solicitud PATCH de cancelación segura para la reserva ID: {}", id);
        
        reservationApplicationService.cancelReservation(id, command);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/admin-cancel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DRIVER')")
    public ResponseEntity<Void> cancelReservationByAdmin(
            @PathVariable("id") UUID id,
            @RequestBody(required = false) CancelReservationCommand command) {
        
        log.debug("[REST-RESERVATIONS] Solicitud PATCH de cancelación administrativa para la reserva ID: {}", id);
        CancelReservationCommand safeCommand = command != null ? command : new CancelReservationCommand(id, "Cancelación administrativa sin motivo especificado");
        
        reservationApplicationService.cancelReservationByAdmin(id, safeCommand);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/scan")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DRIVER')")
    public ResponseEntity<ReservationResponse> scanReservation(@PathVariable("id") UUID id) {
        log.debug("[REST-RESERVATIONS] Solicitud PATCH para marcar escaneo (COMPLETED) de la reserva ID: {}", id);
        return ResponseEntity.ok(reservationApplicationService.scanAndCompleteReservation(id));
    }
}