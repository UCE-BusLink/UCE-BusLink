package com.ucebuslink.tracking.application.port;

import java.util.UUID;

/**
 * Puerto de salida. Los módulos Fleet y Reservations deberán implementar 
 * esta interfaz para responderle a Tracking sin acoplar las bases de datos.
 */
public interface TrackingQueryPort {
    
    // Le pregunta al Fleet Module: "¿Qué viaje está haciendo este bus ahora mismo?"
    UUID getActiveTripIdByBus(UUID busId);
    
    // Le pregunta al Reservations Module: "¿Este estudiante tiene reserva activa en este viaje?"
    boolean hasActiveReservation(UUID userId, UUID tripId);
    
    // Simplificación para el Haversine (Se podría traer el objeto completo de la parada)
    // Devuelve un array: [latitud, longitud] de la próxima parada, o null si no hay.
    double[] getNextStopCoordinates(UUID tripId);
    String getNextStopName(UUID tripId);

    String getBusPlateNumber(UUID busId);
    String getRouteNameByTrip(UUID tripId);
    int getTripOccupiedSeats(UUID tripId);
    int getBusTotalCapacity(UUID busId);
}