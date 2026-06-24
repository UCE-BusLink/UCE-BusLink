package com.ucebuslink.notifications.adapters.input.http;

import com.ucebuslink.notifications.application.dto.NotificationDtos.*;
import com.ucebuslink.notifications.application.service.NotificationApplicationService;
import com.ucebuslink.notifications.domain.model.DeviceToken;
import com.ucebuslink.notifications.domain.model.NotificationPreference;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationApplicationService notificationService;

    @PostMapping("/register-device")
    public ResponseEntity<?> registerDevice(@Valid @RequestBody RegisterDeviceRequest request, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName()); // Extraído del JWT interceptado por SecurityConfig
        
        DeviceToken savedToken = notificationService.registerDevice(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", savedToken.getId(),
                "usuarioId", savedToken.getUserId(),
                "platform", savedToken.getPlatform(),
                "estado", "active",
                "fechaRegistro", savedToken.getCreatedAt()
        ));
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@Valid @RequestBody UpdatePreferencesRequest request, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        
        NotificationPreference updatedPrefs = notificationService.updatePreferences(userId, request);

        return ResponseEntity.ok(Map.of(
                "id", updatedPrefs.getId(),
                "usuarioId", updatedPrefs.getUserId(),
                "notificacionesBusSaliendo", updatedPrefs.isNotifyBusLeaving(),
                "notificacionesBusProximo", updatedPrefs.isNotifyBusApproaching(),
                "notificacionesReservaConfirmada", updatedPrefs.isNotifyReservationConfirmed(),
                "notificacionesCancelacion", updatedPrefs.isNotifyCancellation(),
                "notificacionesPuntosConfianza", updatedPrefs.isNotifyTrustPoints(),
                "fechaActualizacion", updatedPrefs.getUpdatedAt()
        ));
    }
}