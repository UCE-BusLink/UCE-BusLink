package com.ucebuslink.reservations.infrastructure.listeners;

import com.ucebuslink.shared.event.TripCompletedEvent;
import com.ucebuslink.reservations.application.service.ReservationApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TripCompletedEventListener {

    private final ReservationApplicationService reservationApplicationService;

    @EventListener
    public void handleTripCompleted(TripCompletedEvent event) {
        log.info("[RESERVATIONS-LISTENER] Trip completed event received for Trip ID: {}. Processing no-shows (NO_SHOW).", event.tripId());
        reservationApplicationService.processNoShowsForTrip(event.tripId());
    }
}