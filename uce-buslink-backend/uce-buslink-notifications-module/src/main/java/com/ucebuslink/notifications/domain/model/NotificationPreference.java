package com.ucebuslink.notifications.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class NotificationPreference {
    private UUID id;
    private UUID userId;
    private boolean notifyBusLeaving;
    private boolean notifyBusApproaching;
    private boolean notifyReservationConfirmed;
    private boolean notifyCancellation;
    private boolean notifyTrustPoints;
    private LocalDateTime updatedAt;

    // Constructor por defecto según tu documentación
    public static NotificationPreference defaultPreferences(UUID userId) {
        return new NotificationPreference(
                UUID.randomUUID(),
                userId,
                true,  // notificacionesBusSaliendo
                true,  // notificacionesBusProximo
                true,  // notificacionesReservaConfirmada
                false, // notificacionesCancelacion
                true,  // notificacionesPuntosConfianza
                LocalDateTime.now()
        );
    }
}