package com.ucebuslink.reservations.application.port.out;

import java.util.UUID;

import java.time.LocalDateTime;

public interface ReservationToFleetPort {
    /**
     * Validates whether a specific trip is assigned to a specific driver.
     */
    boolean doesTripBelongToDriver(UUID tripId, UUID driverId);

    /**
     * Looks up the trip with a pessimistic lock to guarantee exclusivity for the reservation.
     * If it does not exist, throws an exception that should translate to 404.
     */
    TripData getTripWithLock(UUID tripId);

    record TripData(UUID tripId, String state, int availableSeats, LocalDateTime departureTime) {}
}