package com.ucebuslink.reservations.application.service;

import com.ucebuslink.reservations.application.dto.CreateReservationCommand;
import com.ucebuslink.reservations.application.dto.ReservationResponse;
import com.ucebuslink.reservations.domain.model.Reservation;
import com.ucebuslink.shared.constant.*;
import com.ucebuslink.reservations.domain.model.Seat;
import com.ucebuslink.reservations.domain.repository.ReservationRepository;
import com.ucebuslink.reservations.domain.repository.SeatRepository;
import com.ucebuslink.shared.event.ReservationCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationApplicationService {

    private final ReservationRepository reservationRepository;
    private final SeatRepository seatRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public ReservationResponse reserveSeat(CreateReservationCommand command) {
        log.info("[RESERVATIONS] Intentando reservar asiento {} para el viaje {} por el usuario {}", 
                command.seatId(), command.tripId(), command.userId());

        // 1. Regla de Negocio: Un usuario solo puede tener 1 reserva por viaje
        if (reservationRepository.existsByTripAndUser(command.tripId(), command.userId())) {
            log.warn("[RESERVATIONS] El usuario {} intentó reservar doble en el viaje {}", command.userId(), command.tripId());
            throw new IllegalStateException("Ya tienes una reserva activa para este viaje.");
        }

        // 2. Bloquear el asiento (Si 2 intentan esto, JPA lanzará OptimisticLockingFailureException al guardar)
        Seat seat = seatRepository.findById(command.seatId())
                .orElseThrow(() -> new IllegalArgumentException("Asiento no encontrado."));

        if (seat.getState() != SeatState.AVAILABLE) {
            throw new IllegalStateException("El asiento seleccionado ya no está disponible.");
        }

        seat.setState(SeatState.RESERVED);
        seatRepository.save(seat); // <- El @Version de JPA protege esta línea contra concurrencia

        // 3. Crear la Reserva
        Reservation reservation = new Reservation();
        reservation.setUserId(command.userId());
        reservation.setTripId(command.tripId());
        reservation.setSeatId(command.seatId());
        reservation.setBoardingStopId(command.boardingStopId());
        reservation.setStatus(ReservationStatus.ACTIVE);
        
        // Generar un string único para armar el QR en la app móvil
        String secureToken = UUID.randomUUID().toString(); 
        reservation.setQrCode("BUSLINK-QR-" + secureToken);

        Reservation savedRes = reservationRepository.save(reservation);

        // 4. Lanzar Evento para que el Fleet Module descuente 1 asiento del Trip General
        eventPublisher.publishEvent(new ReservationCreatedEvent(command.tripId()));

        log.info("[RESERVATIONS] Reserva exitosa. ID Reserva: {}, QR generado.", savedRes.getId());
        
        return new ReservationResponse(
                savedRes.getId(), savedRes.getTripId(), 
                savedRes.getSeatId(), savedRes.getStatus(), savedRes.getQrCode()
        );
    }
}