package com.ucebuslink.notifications.application.dto;

import com.ucebuslink.notifications.domain.model.Platform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class NotificationDtos {

    public record RegisterDeviceRequest(
            @NotBlank(message = "El token FCM no puede estar vacío") String fcmToken,
            @NotNull(message = "La plataforma es obligatoria") Platform platform
    ) {}

    public record UpdatePreferencesRequest(
            boolean notificacionesBusSaliendo,
            boolean notificacionesBusProximo,
            boolean notificacionesReservaConfirmada,
            boolean notificacionesCancelacion,
            boolean notificacionesPuntosConfianza
    ) {}

    public record NotificationResponse(
            java.util.UUID id,
            String title,
            String message,
            String type,
            boolean isRead,
            java.time.LocalDateTime createdAt
    ) {}
}