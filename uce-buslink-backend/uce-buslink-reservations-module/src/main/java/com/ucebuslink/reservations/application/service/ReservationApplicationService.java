package com.ucebuslink.reservations.application.service;

import com.ucebuslink.reservations.application.dto.CancelReservationCommand;
import com.ucebuslink.reservations.application.dto.CreateReservationCommand;
import com.ucebuslink.reservations.application.dto.ReservationResponse;
import com.ucebuslink.reservations.application.port.out.ReservationToFleetPort;
import com.ucebuslink.reservations.domain.model.Reservation;
import com.ucebuslink.shared.constant.*;
import com.ucebuslink.reservations.domain.model.Seat;
import com.ucebuslink.reservations.domain.repository.ReservationRepository;
import com.ucebuslink.reservations.domain.repository.SeatRepository;
import com.ucebuslink.shared.event.BoardingCompletedEvent;
import com.ucebuslink.shared.event.ReservationCancelledEvent;
import com.ucebuslink.shared.event.ReservationCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationApplicationService {

    private final ReservationRepository reservationRepository;
    private final SeatRepository seatRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ReservationToFleetPort fleetPort;

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
        eventPublisher.publishEvent(new ReservationCreatedEvent(command.tripId(), command.userId()));

        log.info("[RESERVATIONS] Reserva exitosa. ID Reserva: {}, QR generado.", savedRes.getId());
        
        return new ReservationResponse(
                savedRes.getId(), savedRes.getTripId(), 
                savedRes.getSeatId(), savedRes.getStatus(), savedRes.getQrCode(),
                savedRes.getBoardingStopId()
        );
    }

    @Transactional(readOnly = true)
    public Page<ReservationResponse> getUserReservations(UUID userId, ReservationStatus status, int page, int size) {
        log.debug("[RESERVATIONS] Obteniendo historial de reservas para el usuario: {} con filtro estado: {}", userId, status);
        
        Page<Reservation> domainPage;
        if (status != null) {
            domainPage = reservationRepository.findByUserIdAndStatus(userId, status, PageRequest.of(page, size));
        } else {
            domainPage = reservationRepository.findByUserId(userId, PageRequest.of(page, size));
        }
        return domainPage.map(this::mapToResponse);
    }

    // Nuevo método preparado para cuando el conductor o admin actualicen estados (COMPLETED, NO_SHOW)
    //@Transactional
    //public ReservationResponse updateReservationStatus(UUID reservationId, ReservationStatus newStatus) {
    //    log.info("[RESERVATIONS] Cambio operativo de estado para reserva {}. Nuevo estado: {}", reservationId, newStatus);
    //    
    //    Reservation reservation = reservationRepository.findById(reservationId)
    //            .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada."));
    //    
    //    reservation.setStatus(newStatus);
    //    if (newStatus == ReservationStatus.COMPLETED) {
    //        reservation.setBoardedAt(LocalDateTime.now());
    //    }
    //    
    //    Reservation saved = reservationRepository.save(reservation);
    //    return mapToResponse(saved);
    //}

    @Transactional
    public void cancelReservation(UUID reservationId, CancelReservationCommand command) {
        log.info("[RESERVATIONS] Iniciando proceso de cancelación para la reserva: {}", reservationId);

        // 1. Verificar que la reserva existe y pertenece al usuario
        Reservation reservation = reservationRepository.findByIdAndUserId(reservationId, command.userId())
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada o no pertenece al usuario."));

        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new IllegalStateException("Solo se pueden cancelar reservas en estado ACTIVE.");
        }

        // 2. Liberar el asiento físicamente
        Seat seat = seatRepository.findById(reservation.getSeatId())
                .orElseThrow(() -> new IllegalStateException("Asiento huérfano, no encontrado."));
        
        seat.setState(SeatState.AVAILABLE);
        seatRepository.save(seat);

        // 3. Cancelar la reserva
        reservation.setStatus(ReservationStatus.CANCELLED_BY_STUDENT);
        reservation.setCancelledAt(LocalDateTime.now());
        reservation.setCancelReason(command.reason() != null ? command.reason() : "Cancelada por el estudiante");
        
        reservationRepository.save(reservation);

        // 4. Lanzar evento para devolver +1 cupo al Trip
        eventPublisher.publishEvent(new ReservationCancelledEvent(reservation.getTripId(), command.userId()));

        log.info("[RESERVATIONS] Reserva {} cancelada exitosamente por el usuario. Asiento {} liberado.", reservationId, seat.getId());
    }

    private ReservationResponse mapToResponse(Reservation res) {
        return new ReservationResponse(
                res.getId(), res.getTripId(), 
                res.getSeatId(), res.getStatus(), res.getQrCode(),
                res.getBoardingStopId()
        );
    }

    @Transactional
    public void cancelReservationByAdmin(UUID reservationId, CancelReservationCommand command) {
        log.info("[RESERVATIONS] Proceso de cancelación solicitado por ADMIN/CONDUCTOR para reserva {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada."));

        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new IllegalStateException("Solo se pueden cancelar reservas en estado ACTIVE.");
        }

        Seat seat = seatRepository.findById(reservation.getSeatId())
                .orElseThrow(() -> new IllegalStateException("Asiento no encontrado."));
        
        seat.setState(SeatState.AVAILABLE);
        seatRepository.save(seat);

        reservation.setStatus(ReservationStatus.CANCELLED_BY_ADMIN);
        reservation.setCancelledAt(LocalDateTime.now());
        reservation.setCancelReason(command.reason() != null ? command.reason() : "Cancelada por Administrador/Conductor");
        
        reservationRepository.save(reservation);

        // Devolvemos el cupo al bus
        eventPublisher.publishEvent(new ReservationCancelledEvent(reservation.getTripId(), command.userId()));
        log.info("[RESERVATIONS] Reserva {} cancelada por ADMIN y asiento liberado.", reservationId);
    }

    @Transactional
    public ReservationResponse scanAndCompleteReservation(UUID reservationId) {
        log.info("[RESERVATIONS] Escaneo de QR recibido para la reserva: {}", reservationId);
        
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada."));
        
        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new IllegalStateException("La reserva no está activa. Estado actual: " + reservation.getStatus());
        }

        reservation.setStatus(ReservationStatus.COMPLETED);
        reservation.setBoardedAt(LocalDateTime.now());
        
        Reservation saved = reservationRepository.save(reservation);

        eventPublisher.publishEvent(new BoardingCompletedEvent(saved.getTripId(), saved.getUserId()));

        log.info("[RESERVATIONS] Reserva {} marcada como COMPLETED.", reservationId);
        return mapToResponse(saved);
    }

    @Transactional
    public void processNoShowsForTrip(UUID tripId) {
        log.info("[RESERVATIONS] Procesando NO_SHOWs automáticos para el viaje finalizado: {}", tripId);
        
        java.util.List<Reservation> activeReservations = reservationRepository.findByTripIdAndStatus(tripId, ReservationStatus.ACTIVE);
        
        for (Reservation res : activeReservations) {
            res.setStatus(ReservationStatus.NO_SHOW);
            // El asiento físico ya no importa porque el viaje terminó, 
            // pero la reserva queda penalizada para el sistema de confianza (Trust Score).
            reservationRepository.save(res);
            log.debug("[RESERVATIONS] Reserva {} marcada automáticamente como NO_SHOW", res.getId());
        }
    }

    // Método preparado para cuando el conductor o admin actualicen estados genéricos
    @Transactional
    public ReservationResponse updateReservationStatus(UUID reservationId, ReservationStatus newStatus) {
        log.info("[RESERVATIONS] Cambio operativo de estado para reserva {}. Nuevo estado: {}", reservationId, newStatus);
        
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada."));
        
        reservation.setStatus(newStatus);
        if (newStatus == ReservationStatus.COMPLETED) {
            reservation.setBoardedAt(LocalDateTime.now());
        } else if (newStatus == ReservationStatus.CANCELLED_BY_ADMIN) {
             reservation.setCancelledAt(LocalDateTime.now());
             // También se debería liberar el asiento y lanzar el evento aquí si es cancelada por el admin
        }
        
        Reservation saved = reservationRepository.save(reservation);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public boolean hasActiveUserReservation(UUID userId, UUID tripId) {
        log.debug("[RESERVATIONS] Consultando desde Tracking si el usuario {} tiene reserva en el viaje {}", userId, tripId);
        
        // Usamos la validación que ya tienes en reserveSeat (existsByTripAndUser)
        // Ojo: En un futuro puedes optimizar esto en el Repository para que valide el Status = ACTIVE
        return reservationRepository.existsByTripAndUser(tripId, userId);
    }

    // ... dentro de ReservationApplicationService ...

    @Transactional(readOnly = true)
    public List<UUID> getStudentIdsByTrip(UUID tripId) {
        log.debug("[RESERVATIONS] Consultando estudiantes para el viaje {}", tripId);
        // Supongamos que tu repositorio tiene un método findByTripId(UUID tripId)
        return reservationRepository.findByTripId(tripId).stream()
                // Omitimos los que ya cancelaron
                .filter(res -> res.getStatus() != ReservationStatus.CANCELLED_BY_STUDENT && 
                               res.getStatus() != ReservationStatus.CANCELLED_BY_ADMIN)
                .map(Reservation::getUserId)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UUID> getUnboardedStudentIdsByTrip(UUID tripId) {
        log.debug("[RESERVATIONS] Consultando estudiantes en espera para el viaje {}", tripId);
        return reservationRepository.findByTripId(tripId).stream()
                // Solo traemos a los que están en estado CONFIRMED o PENDING (que aún no abordan)
                .filter(res -> res.getStatus() == ReservationStatus.ACTIVE)
                .map(Reservation::getUserId)
                .toList();
    }

    public Page<ReservationResponse> getReservationsByTripForDriver(UUID tripId, UUID driverId, int page, int size) {
        log.info("[APP-RESERVATIONS] Solicitando lista de pasajeros paginada para el viaje ID: {} por el chofer ID: {}", tripId, driverId);

        // Validación inter-módulo utilizando el puerto
        boolean belongsToDriver = fleetPort.doesTripBelongToDriver(tripId, driverId);
        if (!belongsToDriver) {
            log.warn("[APP-RESERVATIONS] Acceso denegado: El chofer {} intentó acceder a pasajeros del viaje {}", driverId, tripId);
            throw new SecurityException("No tienes permisos para ver los pasajeros de este viaje.");
        }
        
        Pageable pageable = PageRequest.of(page, size);

        return reservationRepository.findActiveReservationsByTripId(tripId, pageable)
                .map(this::mapToResponse); 
    }
}