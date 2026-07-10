package com.ucebuslink.tracking.infrastructure.listeners;

import com.ucebuslink.shared.event.RouteBroadcastEvent;
import com.ucebuslink.shared.event.TripBroadcastEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

// Bridges fleet-module domain events (route/trip created, updated, cancelled...) onto the
// STOMP broker so every connected client (student/driver/admin) sees the change instantly,
// without needing to poll or refetch. fleet-module never depends on the websocket
// infrastructure directly; it only publishes a plain Spring event.
@Slf4j
@Component
@RequiredArgsConstructor
public class RouteTripBroadcastListener {

    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleRouteChanged(RouteBroadcastEvent event) {
        log.info("[WS-BROADCAST] Route {} changed ({}), broadcasting to /topic/routes",
                event.routeId(), event.changeType());
        messagingTemplate.convertAndSend("/topic/routes", event);
    }

    @EventListener
    public void handleTripChanged(TripBroadcastEvent event) {
        log.info("[WS-BROADCAST] Trip {} changed ({}), broadcasting to /topic/trips",
                event.tripId(), event.changeType());
        messagingTemplate.convertAndSend("/topic/trips", event);
    }
}
