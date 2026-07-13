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
import com.ucebuslink.reservations.domain.exception.*;
import com.ucebuslink.shared.event.BoardingCompletedEvent;
import com.ucebuslink.shared.event.NoShowEvent;
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

import com.ucebuslink.reservations.application.dto.DriverPassengerResponse;

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
    private final com.ucebuslink.reservations.application.port.out.ReservationToIdentityPort identityPort;

    @Transactional
    public ReservationResponse reserveSeat(CreateReservationCommand command) {
        log.trace("[RESERVATIONS] TRACE: Validating JWT token and STUDENT role for user {}", command.userId());
        // 1. JWT and role validated by @PreAuthorize in Controller.
        
        log.debug("[RESERVATIONS] DEBUG: Requesting PESSIMISTIC_WRITE lock for trip {}", command.tripId());
        
        // 2. Look up the Trip with a PESSIMISTIC lock
        ReservationToFleetPort.TripData tripData = fleetPort.getTripWithLock(command.tripId());
        if (tripData == null) {
            log.error("[RESERVATIONS] ERROR: Trip {} does not exist.", command.tripId());
            throw new TripNotFoundException("El viaje seleccionado ya no existe");
        }

        // 3. Verify trip state
        log.trace("[RESERVATIONS] TRACE: Current trip state: {}", tripData.state());
        if (!tripData.state().equals("SCHEDULED") && !tripData.state().equals("ONGOING")) {
            log.warn("[RESERVATIONS] WARN: Reservation attempt on a finished/cancelled trip {}", command.tripId());
            throw new TripAlreadyStartedException("Este viaje ya finalizo o fue cancelado; ya no admite reservas");
        }

        // Extra: verify Trust Score
        int trustScore = identityPort.getStudentTrustScore(command.userId());
        if (trustScore < 50) { // Example of a minimum required score
            throw new InsufficientTrustScoreException("Tu puntaje de confianza es muy bajo para reservar en este momento", trustScore, 50);
        }

        if (reservationRepository.existsByTripAndUser(command.tripId(), command.userId())) {
            log.warn("[RESERVATIONS] WARN: User {} already has a reservation on trip {}", command.userId(), command.tripId());
            throw new DuplicateReservationException("Ya tienes una reserva para este viaje");
        }

        // 4. Count available seats
        List<Seat> tripSeats = seatRepository.findByTripId(command.tripId());
        long availableCount = tripSeats.stream().filter(s -> s.getState() == SeatState.AVAILABLE).count();
        if (availableCount == 0) {
            log.warn("[RESERVATIONS] WARN: No seats available on trip {}", command.tripId());
            throw new NoAvailableSeatsException("Todos los asientos de este viaje ya estan reservados");
        }

        Seat selectedSeat = null;

        // 5 & 6. Assign the preferred seat or the first available one
        if (command.seatId() != null) {
            selectedSeat = seatRepository.findById(command.seatId())
                    .orElseThrow(() -> new SeatNoLongerAvailableException("El asiento que seleccionaste acaba de ser reservado por otro usuario"));
            
            if (selectedSeat.getState() != SeatState.AVAILABLE) {
                throw new SeatNoLongerAvailableException("El asiento que seleccionaste acaba de ser reservado por otro usuario");
            }
        } else {
            selectedSeat = tripSeats.stream()
                    .filter(s -> s.getState() == SeatState.AVAILABLE)
                    .findFirst()
                    .orElseThrow(() -> new NoAvailableSeatsException("All seats for this trip are reserved"));
        }

        // 7. Change Seat state to RESERVED
        selectedSeat.setState(SeatState.RESERVED);
        seatRepository.save(selectedSeat);

        // 8. Create Reservation record
        Reservation reservation = new Reservation();
        reservation.setUserId(command.userId());
        reservation.setTripId(command.tripId());
        reservation.setSeatId(selectedSeat.getId());
        reservation.setBoardingStopId(command.boardingStopId());
        reservation.setStatus(ReservationStatus.ACTIVE);
        
        String secureToken = UUID.randomUUID().toString(); 
        reservation.setQrCode("BUSLINK-QR-" + secureToken);

        Reservation savedRes = reservationRepository.save(reservation);

        // 9. Publish ReservationCreatedEvent
        eventPublisher.publishEvent(new ReservationCreatedEvent(command.tripId(), command.userId()));

        log.info("[RESERVATIONS] INFO: Reservation successful. Reservation ID: {}, QR generated.", savedRes.getId());
        
        // 10. COMMIT is implicitly executed when exiting @Transactional
        return new ReservationResponse(
                savedRes.getId(), savedRes.getTripId(), 
                savedRes.getSeatId(), savedRes.getStatus(), savedRes.getQrCode(),
                savedRes.getBoardingStopId()
        );
    }

    @Transactional(readOnly = true)
    public Page<ReservationResponse> getUserReservations(UUID userId, ReservationStatus status, int page, int size) {
        log.debug("[RESERVATIONS] Fetching reservation history for user: {} with status filter: {}", userId, status);
        
        Page<Reservation> domainPage;
        if (status != null) {
            domainPage = reservationRepository.findByUserIdAndStatus(userId, status, PageRequest.of(page, size));
        } else {
            domainPage = reservationRepository.findByUserId(userId, PageRequest.of(page, size));
        }
        return domainPage.map(this::mapToResponse);
    }

    // New method prepared for when the driver or admin updates statuses (COMPLETED, NO_SHOW)
    //@Transactional
    //public ReservationResponse updateReservationStatus(UUID reservationId, ReservationStatus newStatus) {
    //    log.info("[RESERVATIONS] Operational status change for reservation {}. New status: {}", reservationId, newStatus);
    //    
    //    Reservation reservation = reservationRepository.findById(reservationId)
    //            .orElseThrow(() -> new IllegalArgumentException("Reservation not found."));
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
        log.info("[RESERVATIONS] Starting cancellation process for reservation: {}", reservationId);

        // 1. Verify the reservation exists and belongs to the user
        Reservation reservation = reservationRepository.findByIdAndUserId(reservationId, command.userId())
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found or does not belong to the user."));

        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new IllegalStateException("Solo se pueden cancelar reservas activas");
        }

        // 2. Physically release the seat
        Seat seat = seatRepository.findById(reservation.getSeatId())
                .orElseThrow(() -> new IllegalStateException("Orphaned seat, not found."));
        
        seat.setState(SeatState.AVAILABLE);
        seatRepository.save(seat);

        // 3. Cancel the reservation
        reservation.setStatus(ReservationStatus.CANCELLED_BY_STUDENT);
        reservation.setCancelledAt(LocalDateTime.now());
        reservation.setCancelReason(command.reason() != null ? command.reason() : "Cancelled by the student");
        
        reservationRepository.save(reservation);

        // Fetch the trip to calculate whether this is a late cancellation (< 15 mins)
        ReservationToFleetPort.TripData tripData = fleetPort.getTripWithLock(reservation.getTripId());
        boolean isLateCancellation = false;
        if (tripData != null && tripData.departureTime() != null) {
            LocalDateTime departureTime = tripData.departureTime();
            isLateCancellation = LocalDateTime.now().plusMinutes(15).isAfter(departureTime);
        }

        // 4. Publish event to return +1 slot to the Trip
        eventPublisher.publishEvent(new ReservationCancelledEvent(reservation.getTripId(), command.userId(), isLateCancellation));

        log.info("[RESERVATIONS] Reservation {} successfully cancelled by the user. Seat {} released. Late: {}", reservationId, seat.getId(), isLateCancellation);
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
        log.info("[RESERVATIONS] Cancellation process requested by ADMIN/DRIVER for reservation {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found."));

        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new IllegalStateException("Solo se pueden cancelar reservas activas");
        }

        Seat seat = seatRepository.findById(reservation.getSeatId())
                .orElseThrow(() -> new IllegalStateException("Seat not found."));
        
        seat.setState(SeatState.AVAILABLE);
        seatRepository.save(seat);

        reservation.setStatus(ReservationStatus.CANCELLED_BY_ADMIN);
        reservation.setCancelledAt(LocalDateTime.now());
        reservation.setCancelReason(command.reason() != null ? command.reason() : "Cancelled by Administrator/Driver");
        
        reservationRepository.save(reservation);

        // Return the seat slot to the bus (no penalty for administrative cancellation)
        eventPublisher.publishEvent(new ReservationCancelledEvent(reservation.getTripId(), command.userId(), false));
        log.info("[RESERVATIONS] Reservation {} cancelled by ADMIN and seat released.", reservationId);
    }

    @Transactional
    public ReservationResponse scanAndCompleteReservation(UUID reservationId) {
        log.info("[RESERVATIONS] QR scan received for reservation: {}", reservationId);
        
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found."));
        
        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new IllegalStateException("The reservation is not active. Current status: " + reservation.getStatus());
        }

        reservation.setStatus(ReservationStatus.COMPLETED);
        reservation.setBoardedAt(LocalDateTime.now());
        
        Reservation saved = reservationRepository.save(reservation);

        eventPublisher.publishEvent(new BoardingCompletedEvent(saved.getTripId(), saved.getUserId()));

        log.info("[RESERVATIONS] Reservation {} marked as COMPLETED.", reservationId);
        return mapToResponse(saved);
    }

    @Transactional
    public void processNoShowsForTrip(UUID tripId) {
        log.info("[RESERVATIONS] Processing automatic NO_SHOWs for finished trip: {}", tripId);
        
        java.util.List<Reservation> activeReservations = reservationRepository.findByTripIdAndStatus(tripId, ReservationStatus.ACTIVE);
        
        for (Reservation res : activeReservations) {
            res.setStatus(ReservationStatus.NO_SHOW);
            // The physical seat no longer matters because the trip has ended,
            // but the reservation remains penalized for the trust system (Trust Score).
            reservationRepository.save(res);
            
            // Publish NO_SHOW event
            eventPublisher.publishEvent(new NoShowEvent(tripId, res.getUserId()));
            
            log.debug("[RESERVATIONS] Reservation {} automatically marked as NO_SHOW", res.getId());
        }
    }

    // Method prepared for when the driver or admin updates generic statuses
    @Transactional
    public ReservationResponse updateReservationStatus(UUID reservationId, ReservationStatus newStatus) {
        log.info("[RESERVATIONS] Operational status change for reservation {}. New status: {}", reservationId, newStatus);
        
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found."));
        
        reservation.setStatus(newStatus);
        if (newStatus == ReservationStatus.COMPLETED) {
            reservation.setBoardedAt(LocalDateTime.now());
        } else if (newStatus == ReservationStatus.CANCELLED_BY_ADMIN) {
             reservation.setCancelledAt(LocalDateTime.now());
             // The seat should also be released and the event fired here if cancelled by the admin
        }
        
        Reservation saved = reservationRepository.save(reservation);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public boolean hasActiveUserReservation(UUID userId, UUID tripId) {
        log.debug("[RESERVATIONS] Checking from Tracking whether user {} has a reservation on trip {}", userId, tripId);
        
        // We use the validation you already have in reserveSeat (existsByTripAndUser)
        // Note: this could be optimized in the Repository in the future to validate Status = ACTIVE
        return reservationRepository.existsByTripAndUser(tripId, userId);
    }

    @Transactional(readOnly = true)
    public List<UUID> getStudentIdsByTrip(UUID tripId) {
        log.debug("[RESERVATIONS] Querying students for trip {}", tripId);
        // Assuming your repository has a findByTripId(UUID tripId) method
        return reservationRepository.findByTripId(tripId).stream()
                // Skip the ones that already cancelled
                .filter(res -> res.getStatus() != ReservationStatus.CANCELLED_BY_STUDENT && 
                               res.getStatus() != ReservationStatus.CANCELLED_BY_ADMIN)
                .map(Reservation::getUserId)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UUID> getUnboardedStudentIdsByTrip(UUID tripId) {
        log.debug("[RESERVATIONS] Querying waiting students for trip {}", tripId);
        return reservationRepository.findByTripId(tripId).stream()
                // We only bring back those in CONFIRMED or PENDING status (who haven't boarded yet)
                .filter(res -> res.getStatus() == ReservationStatus.ACTIVE)
                .map(Reservation::getUserId)
                .toList();
    }

    @Transactional(readOnly = true)
    public int getBoardedStudentCount(UUID tripId) {
        log.debug("[RESERVATIONS] Querying number of boarded students for trip {}", tripId);
        return reservationRepository.countByTripIdAndStatus(tripId, ReservationStatus.COMPLETED);
    }

    public Page<DriverPassengerResponse> getReservationsByTripForDriver(UUID tripId, UUID driverId, int page, int size) {
        log.info("[APP-RESERVATIONS] Requesting paginated passenger list for trip ID: {} by driver ID: {}", tripId, driverId);

        // The driver-ownership restriction is removed,
        // since the returned information (names and statuses) is not sensitive.
        
        List<Reservation> allReservations = reservationRepository.findByTripId(tripId);
        
        List<DriverPassengerResponse> filtered = allReservations.stream()
                .filter(res -> res.getStatus() == ReservationStatus.ACTIVE || res.getStatus() == ReservationStatus.COMPLETED)
                .map(res -> new DriverPassengerResponse(
                        res.getId(),
                        res.getTripId(),
                        res.getSeatId(),
                        res.getStatus(),
                        res.getBoardingStopId(),
                        identityPort.getStudentFullName(res.getUserId())
                ))
                .toList();
                
        int start = Math.min(page * size, filtered.size());
        int end = Math.min(start + size, filtered.size());
        
        return new org.springframework.data.domain.PageImpl<>(
                filtered.subList(start, end), 
                PageRequest.of(page, size), 
                filtered.size()
        );
    }
}