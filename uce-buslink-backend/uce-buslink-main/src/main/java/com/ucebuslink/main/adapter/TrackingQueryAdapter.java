package com.ucebuslink.main.adapter;

import com.ucebuslink.reservations.application.service.ReservationApplicationService;
import com.ucebuslink.supervisor.application.service.TripApplicationService;
import com.ucebuslink.tracking.application.port.TrackingQueryPort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Adaptador de Arquitectura Hexagonal.
 * Lives in the Main module because it is the only one that imports all the other modules.
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
        // 🔥 Datos reales desde la BD de Flotas
        return tripApplicationService.getNextStopCoordinates(tripId);
    }

    @Override
    public String getNextStopName(UUID tripId) {
        // 🔥 Datos reales desde la BD de Flotas
        return tripApplicationService.getNextStopName(tripId);
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

    @Override
    public List<UUID> getUnboardedStudentIdsByTrip(UUID tripId) {
        // We delegate the actual call to the reservations module
        return reservationApplicationService.getUnboardedStudentIdsByTrip(tripId);
    }

    @Override
    public int getBoardedStudentCount(UUID tripId) {
        return reservationApplicationService.getBoardedStudentCount(tripId);
    }
}