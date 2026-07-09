package com.ucebuslink.tracking.infrastructure.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.ucebuslink.tracking.application.port.TrackingQueryPort;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionSecurityInterceptor implements ChannelInterceptor {

    private final TrackingQueryPort trackingQueryPort;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // We only intercept when someone attempts to subscribe to a channel (Students opening the map)
        if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            Authentication userAuth = (Authentication) accessor.getUser();

            log.debug("[WEBSOCKET-SECURITY] User {} attempting to subscribe to {}",
                    userAuth != null ? userAuth.getName() : "Anonymous", destination);

            if (destination != null && destination.startsWith("/topic/trip/")) {
                
                if (userAuth == null) {
                    throw new IllegalArgumentException("Not authenticated.");
                }

                boolean isAdminOrSupervisor = userAuth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPERVISOR"));

                // If not an administrator, we validate that they have an actual reservation in the reservations module
                if (!isAdminOrSupervisor) {
                    UUID tripId;
                    UUID userId;
                    try {
                        // Extract the tripId from the URL "/topic/trip/1234.../location-update"
                        String[] parts = destination.split("/");
                        tripId = UUID.fromString(parts[3]);
                        userId = (UUID) userAuth.getDetails();
                    } catch (Exception e) {
                        log.error("[WEBSOCKET-SECURITY] Error parsing the subscription: {}", destination);
                        throw new IllegalArgumentException("Invalid subscription destination.");
                    }

                    if (userId == null) {
                        throw new IllegalArgumentException("User not synchronized.");
                    }

                    boolean hasReservation = trackingQueryPort.hasActiveReservation(userId, tripId);
                    if (!hasReservation) {
                        log.warn("[WEBSOCKET-SECURITY] Subscription denied. Student {} does not have a reservation on trip {}", userId, tripId);
                        throw new IllegalArgumentException("You do not have an active reservation for this trip.");
                    }
                }
            }
        }
        return message;
    }
}