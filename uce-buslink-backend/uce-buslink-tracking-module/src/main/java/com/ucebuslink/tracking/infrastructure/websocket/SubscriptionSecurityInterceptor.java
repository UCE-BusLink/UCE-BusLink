package com.ucebuslink.tracking.infrastructure.websocket;

import com.ucebuslink.tracking.application.port.out.TrackingQueryPort;
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

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionSecurityInterceptor implements ChannelInterceptor {

    // private final TrackingQueryPort trackingQueryPort; // Descomentar cuando se implemente

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // Interceptamos solo cuando alguien intenta suscribirse a un canal (Estudiantes abriendo el mapa)
        if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            Authentication userAuth = (Authentication) accessor.getUser();

            log.debug("[WEBSOCKET-SECURITY] Usuario {} intentando suscribirse a {}", 
                    userAuth != null ? userAuth.getName() : "Anonimo", destination);

            if (destination != null && destination.startsWith("/topic/trip/")) {
                
                if (userAuth == null) {
                    throw new IllegalArgumentException("No autenticado.");
                }

                boolean isAdminOrSupervisor = userAuth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPERVISOR"));

                // Si no es un administrador, validamos que tenga una reserva física en el módulo de reservas
                if (!isAdminOrSupervisor) {
                    try {
                        // Extraer el tripId de la URL "/topic/trip/1234.../location-update"
                        String[] parts = destination.split("/");
                        UUID tripId = UUID.fromString(parts[3]);
                        UUID userId = UUID.fromString(userAuth.getName());

                        /*
                        boolean hasReservation = trackingQueryPort.hasActiveReservation(userId, tripId);
                        if (!hasReservation) {
                            log.warn("[WEBSOCKET-SECURITY] Suscripción denegada. Estudiante {} no tiene reserva en viaje {}", userId, tripId);
                            throw new IllegalArgumentException("No tienes reserva activa para este viaje.");
                        }
                        */
                    } catch (Exception e) {
                        log.error("[WEBSOCKET-SECURITY] Error parseando TripId de la suscripción: {}", destination);
                        throw new IllegalArgumentException("Destino de suscripción inválido.");
                    }
                }
            }
        }
        return message;
    }
}