package com.ucebuslink.reservations.infrastructure.listeners;

import com.ucebuslink.shared.event.TripCreatedEvent;
import com.ucebuslink.reservations.application.service.SeatApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TripCreatedEventListener {

    private final SeatApplicationService seatApplicationService;

    // Automatically listens for the event fired from the Fleet Module
    @EventListener
    public void handleTripCreatedEvent(TripCreatedEvent event) {
        log.info("[RESERVATIONS-LISTENER] TripCreatedEvent received. Trip ID: {}, Capacity: {}",
                event.tripId(), event.seatCapacity());
        
        seatApplicationService.generateSeatsForTrip(event.tripId(), event.seatCapacity());
    }
}