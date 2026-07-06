package com.ucebuslink.reservations.application.port.out;

import java.util.UUID;

import java.time.LocalDateTime;

public interface ReservationToFleetPort {
    /**
     * Valida si un viaje específico está asignado a un chofer específico.
     */
    boolean doesTripBelongToDriver(UUID tripId, UUID driverId);
    
    /**
     * Busca el viaje con un lock pesimista para garantizar exclusividad en la reserva.
     * Si no existe, lanza una excepción que debería traducirse a 404.
     */
    TripData getTripWithLock(UUID tripId);

    record TripData(UUID tripId, String state, int availableSeats, LocalDateTime departureTime) {}
}