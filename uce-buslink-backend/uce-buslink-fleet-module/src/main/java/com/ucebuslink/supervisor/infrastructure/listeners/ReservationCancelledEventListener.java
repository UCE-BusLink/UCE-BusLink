package com.ucebuslink.supervisor.infrastructure.listeners;

import com.ucebuslink.shared.event.ReservationCancelledEvent;
import com.ucebuslink.supervisor.domain.model.Trip;
import com.ucebuslink.supervisor.domain.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationCancelledEventListener {

    private final TripRepository tripRepository;

    @EventListener
    @Transactional
    public void handleReservationCancelled(ReservationCancelledEvent event) {
        log.info("[FLEET-LISTENER] Sumando +1 asiento al Viaje ID: {} por cancelación de reserva", event.tripId());
        
        Trip trip = tripRepository.findById(event.tripId())
                .orElseThrow(() -> new IllegalArgumentException("Viaje no encontrado"));

        trip.setAvailableSeats(trip.getAvailableSeats() + 1);
        tripRepository.save(trip);
    }
}