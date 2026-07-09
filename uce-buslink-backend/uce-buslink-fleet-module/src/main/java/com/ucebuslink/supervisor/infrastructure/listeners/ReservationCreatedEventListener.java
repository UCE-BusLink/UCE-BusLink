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
        log.info("[FLEET-LISTENER] Deducting 1 seat from Trip ID: {} for new reservation", event.tripId());

        Trip trip = tripRepository.findById(event.tripId())
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        if (trip.getAvailableSeats() > 0) {
            trip.setAvailableSeats(trip.getAvailableSeats() - 1);
            tripRepository.save(trip);
        } else {
            log.warn("[FLEET-LISTENER] Inconsistency: Trip {} no longer has seats in the general counter.", event.tripId());
        }
    }
}