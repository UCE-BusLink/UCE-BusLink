package com.ucebuslink.notifications.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationPreference {
    private UUID id;
    private UUID userId;
    private boolean notifyBusLeaving;
    private boolean notifyBusApproaching;
    private boolean notifyReservationConfirmed;
    private boolean notifyCancellation;
    private boolean notifyTrustPoints;
    private LocalDateTime updatedAt;

    public NotificationPreference() {}

    public NotificationPreference(UUID id, UUID userId, boolean notifyBusLeaving, boolean notifyBusApproaching, boolean notifyReservationConfirmed, boolean notifyCancellation, boolean notifyTrustPoints, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.notifyBusLeaving = notifyBusLeaving;
        this.notifyBusApproaching = notifyBusApproaching;
        this.notifyReservationConfirmed = notifyReservationConfirmed;
        this.notifyCancellation = notifyCancellation;
        this.notifyTrustPoints = notifyTrustPoints;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public boolean isNotifyBusLeaving() { return notifyBusLeaving; }
    public void setNotifyBusLeaving(boolean notifyBusLeaving) { this.notifyBusLeaving = notifyBusLeaving; }
    public boolean isNotifyBusApproaching() { return notifyBusApproaching; }
    public void setNotifyBusApproaching(boolean notifyBusApproaching) { this.notifyBusApproaching = notifyBusApproaching; }
    public boolean isNotifyReservationConfirmed() { return notifyReservationConfirmed; }
    public void setNotifyReservationConfirmed(boolean notifyReservationConfirmed) { this.notifyReservationConfirmed = notifyReservationConfirmed; }
    public boolean isNotifyCancellation() { return notifyCancellation; }
    public void setNotifyCancellation(boolean notifyCancellation) { this.notifyCancellation = notifyCancellation; }
    public boolean isNotifyTrustPoints() { return notifyTrustPoints; }
    public void setNotifyTrustPoints(boolean notifyTrustPoints) { this.notifyTrustPoints = notifyTrustPoints; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

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