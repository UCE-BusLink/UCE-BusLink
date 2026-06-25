package com.ucebuslink.reservations.application.port.out;

import java.util.UUID;

public interface ReservationToFleetPort {
    /**
     * Valida si un viaje específico está asignado a un chofer específico.
     */
    boolean doesTripBelongToDriver(UUID tripId, UUID driverId);
}