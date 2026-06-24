package com.ucebuslink.main.adapter;

import com.ucebuslink.reservations.application.service.ReservationApplicationService;
import com.ucebuslink.supervisor.application.service.TripApplicationService;
import com.ucebuslink.tracking.application.port.out.TrackingQueryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Adaptador de Arquitectura Hexagonal.
 * Vive en el módulo Main porque es el único que importa a todos los demás módulos.
 * Implementa el puerto de Tracking y delega las consultas a Fleet y Reservations.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TrackingQueryAdapter implements TrackingQueryPort {

    private final TripApplicationService tripApplicationService;
    private final ReservationApplicationService reservationApplicationService;

    @Override
    public UUID getActiveTripIdByBus(UUID busId) {
        return tripApplicationService.getActiveTripIdByBus(busId);
    }

    @Override
    public boolean hasActiveReservation(UUID userId, UUID tripId) {
        return reservationApplicationService.hasActiveUserReservation(userId, tripId);
    }

    @Override
    public double[] getNextStopCoordinates(UUID tripId) {
        // TODO: (Para no asumir código) 
        // Aquí deberás llamar a un método de tu RouteApplicationService que te devuelva 
        // las coordenadas de la siguiente parada del viaje. 
        // Por ahora, devolvemos las coordenadas centrales de la UCE para que tu Haversine no falle.
        return new double[]{-0.1993, -78.5053}; 
    }

    @Override
    public String getNextStopName(UUID tripId) {
        // TODO: (Para no asumir código)
        // Igualmente, aquí consultarás el nombre de la parada.
        return "Parada UCE (Mock)";
    }

    @Override
    public String getBusPlateNumber(UUID busId) {
        return tripApplicationService.getBusPlateNumber(busId);
    }

    @Override
    public String getRouteNameByTrip(UUID tripId) {
        return tripApplicationService.getRouteNameByTrip(tripId);
    }

    @Override
    public int getTripOccupiedSeats(UUID tripId) {
        return tripApplicationService.getTripOccupiedSeats(tripId);
    }

    @Override
    public int getBusTotalCapacity(UUID busId) {
        return tripApplicationService.getBusTotalCapacity(busId);
    }
}