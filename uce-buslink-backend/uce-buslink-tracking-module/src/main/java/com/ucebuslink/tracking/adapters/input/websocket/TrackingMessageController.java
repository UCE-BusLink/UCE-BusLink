package com.ucebuslink.tracking.adapters.input.websocket;

import com.ucebuslink.tracking.application.dto.GpsUpdatePayload;
import com.ucebuslink.tracking.application.service.TrackingApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class TrackingMessageController {

    private final TrackingApplicationService trackingApplicationService;

    // Este método escucha en el destino "/app/gps.update" (el "/app" viene de WebSocketConfig)
    @MessageMapping("/gps.update")
    public void handleGpsUpdate(@Payload GpsUpdatePayload payload, Authentication authentication) {
        
        // 1. Extraemos el ID del usuario directamente del token interceptado en el handshake
        String userId = authentication.getName();

        // 2. Verificamos que el usuario que envía el mensaje sea realmente un CONDUCTOR
        boolean isDriver = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DRIVER"));

        if (!isDriver) {
            log.warn("[WEBSOCKET-TRACKING] Intento de actualización GPS bloqueado. El usuario {} no es CONDUCTOR.", userId);
            // En WebSockets no se lanza un error HTTP 403, simplemente se ignora o se envía un mensaje de error a una cola privada
            return; 
        }

        // 3. Procesamos la coordenada
        trackingApplicationService.processGpsUpdate(payload, userId);
    }
}