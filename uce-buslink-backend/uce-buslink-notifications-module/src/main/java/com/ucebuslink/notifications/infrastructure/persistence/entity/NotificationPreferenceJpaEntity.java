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
@Getter
@Setter
@NoArgsConstructor
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
}