package com.ucebuslink.supervisor.infrastructure.listeners;

import com.ucebuslink.shared.event.ReservationCreatedEvent;
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
public class ReservationCreatedEventListener {

    private final TripRepository tripRepository;

    @EventListener
    @Transactional
    public void handleReservationCreated(ReservationCreatedEvent event) {
        log.info("[FLEET-LISTENER] Descontando 1 asiento del Viaje ID: {} por nueva reserva", event.tripId());
        
        Trip trip = tripRepository.findById(event.tripId())
                .orElseThrow(() -> new IllegalArgumentException("Viaje no encontrado"));

        if (trip.getAvailableSeats() > 0) {
            trip.setAvailableSeats(trip.getAvailableSeats() - 1);
            tripRepository.save(trip);
        } else {
            log.warn("[FLEET-LISTENER] Inconsistencia: El viaje {} ya no tiene asientos en el contador general.", event.tripId());
        }
    }
}