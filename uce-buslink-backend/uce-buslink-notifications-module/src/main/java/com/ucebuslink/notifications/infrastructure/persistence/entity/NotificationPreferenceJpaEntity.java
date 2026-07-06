package com.ucebuslink.notifications.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_preferences", indexes = {
    @Index(name = "idx_notif_prefs_user_id", columnList = "user_id", unique = true)
})
public class NotificationPreferenceJpaEntity {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "notify_bus_leaving", nullable = false)
    private boolean notifyBusLeaving;

    @Column(name = "notify_bus_approaching", nullable = false)
    private boolean notifyBusApproaching;

    @Column(name = "notify_reservation_confirmed", nullable = false)
    private boolean notifyReservationConfirmed;

    @Column(name = "notify_cancellation", nullable = false)
    private boolean notifyCancellation;

    @Column(name = "notify_trust_points", nullable = false)
    private boolean notifyTrustPoints;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public NotificationPreferenceJpaEntity() {}

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
}