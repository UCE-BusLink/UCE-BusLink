package com.ucebuslink.reservations.domain.repository;

import com.ucebuslink.reservations.domain.model.Reservation;
import com.ucebuslink.shared.constant.ReservationStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReservationRepository {
    Reservation save(Reservation reservation);
    boolean existsByTripAndUser(UUID tripId, UUID userId);

    Page<Reservation> findByUserId(UUID userId, Pageable pageable);
    Optional<Reservation> findByIdAndUserId(UUID id, UUID userId);

    Page<Reservation> findByUserIdAndStatus(UUID userId, ReservationStatus status, Pageable pageable);

    Optional<Reservation> findById(UUID id);

    java.util.List<Reservation> findByTripIdAndStatus(UUID tripId, ReservationStatus status);
    
    int countByTripIdAndStatus(UUID tripId, ReservationStatus status);

    List<Reservation> findByTripId(UUID tripId);

    Page<Reservation> findActiveReservationsByTripId(UUID tripId, Pageable pageable);
}