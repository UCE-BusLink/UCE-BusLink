package com.ucebuslink.reservations.domain.repository;

import com.ucebuslink.reservations.domain.model.Reservation;
import java.util.UUID;

public interface ReservationRepository {
    Reservation save(Reservation reservation);
    boolean existsByTripAndUser(UUID tripId, UUID userId);
}