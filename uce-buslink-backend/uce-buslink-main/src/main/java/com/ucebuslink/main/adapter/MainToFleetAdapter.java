package com.ucebuslink.main.adapter;

import com.ucebuslink.reservations.application.port.out.ReservationToFleetPort;
import com.ucebuslink.supervisor.domain.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MainToFleetAdapter implements ReservationToFleetPort {

    // Inyectamos solo el repositorio de viajes
    private final TripRepository tripRepository;

    @Override
    public boolean doesTripBelongToDriver(UUID tripId, UUID driverId) {
        return tripRepository.findById(tripId)
                .map(trip -> trip.getDriverId().equals(driverId))
                .orElse(false); 
    }

    @Override
    public TripData getTripWithLock(UUID tripId) {
        return tripRepository.findByIdWithLock(tripId)
                .map(trip -> new TripData(trip.getId(), trip.getState().name(), trip.getAvailableSeats(), trip.getDepartureTime()))
                .orElse(null);
    }
}