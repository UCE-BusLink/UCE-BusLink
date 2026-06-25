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

    @MessageMapping("/gps.update")
    public void handleGpsUpdate(@Payload GpsUpdatePayload payload, Authentication authentication) {
        
        String userId = authentication.getName();

        boolean isDriver = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DRIVER"));

        if (!isDriver) {
            log.warn("[WEBSOCKET-TRACKING] Intento de actualización GPS bloqueado. El usuario {} no es CONDUCTOR.", userId);
            return; 
        }

        trackingApplicationService.processGpsUpdate(payload, userId);
    }
}