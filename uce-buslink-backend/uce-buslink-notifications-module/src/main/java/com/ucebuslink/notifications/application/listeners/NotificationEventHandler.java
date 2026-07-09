package com.ucebuslink.notifications.application.listeners;

import com.ucebuslink.notifications.domain.model.Notification;
import com.ucebuslink.notifications.domain.model.NotificationPreference;
import com.ucebuslink.notifications.domain.repository.DeviceTokenRepository;
import com.ucebuslink.notifications.domain.repository.NotificationPreferenceRepository;
import com.ucebuslink.notifications.domain.repository.NotificationRepository;
import com.ucebuslink.notifications.infrastructure.external.fcm.FcmNotificationAdapter;
import com.ucebuslink.shared.event.BoardingCompletedEvent;
import com.ucebuslink.shared.event.NoShowEvent;
import com.ucebuslink.shared.event.ReservationCancelledEvent;
import com.ucebuslink.shared.event.ReservationCreatedEvent;
import com.ucebuslink.shared.event.TripCancelledEvent;
import com.ucebuslink.shared.event.TripReminderEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import com.ucebuslink.notifications.domain.model.DeviceToken;

@Component
public class NotificationEventHandler {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventHandler.class);

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final FcmNotificationAdapter fcmAdapter;

    public NotificationEventHandler(
            NotificationRepository notificationRepository,
            NotificationPreferenceRepository preferenceRepository,
            DeviceTokenRepository deviceTokenRepository,
            FcmNotificationAdapter fcmAdapter) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.deviceTokenRepository = deviceTokenRepository;
        this.fcmAdapter = fcmAdapter;
    }

    @Async
    @EventListener
    public void handleReservationCreatedEvent(ReservationCreatedEvent event) {
        log.info("[NOTIFICATIONS] Handling ReservationCreatedEvent for user {}", event.userId());
        
        NotificationPreference prefs = getPreferences(event.userId());
        if (!prefs.isNotifyReservationConfirmed()) return;

        String title = "Reserva Confirmada";
        String message = "Tu reserva ha sido confirmada con éxito.";
        
        saveAndSendPush(event.userId(), title, message, "RESERVATION");
    }

    @Async
    @EventListener
    public void handleReservationCancelledEvent(ReservationCancelledEvent event) {
        log.info("[NOTIFICATIONS] Handling ReservationCancelledEvent for user {}", event.userId());

        NotificationPreference prefs = getPreferences(event.userId());
        if (!prefs.isNotifyCancellation()) return;

        String title = "Reserva Cancelada";
        String message = event.isLateCancellation() ? 
            "Tu reserva ha sido cancelada. Al ser una cancelación tardía, tu Trust Score ha sido penalizado con -5 puntos." :
            "Tu reserva ha sido cancelada exitosamente.";
        
        saveAndSendPush(event.userId(), title, message, "CANCELLATION");
    }

    @Async
    @EventListener
    public void handleBoardingCompletedEvent(BoardingCompletedEvent event) {
        log.info("[NOTIFICATIONS] Handling BoardingCompletedEvent for user {}", event.userId());

        NotificationPreference prefs = getPreferences(event.userId());
        if (!prefs.isNotifyTrustPoints()) return;

        String title = "Abordaje Exitoso";
        String message = "Gracias por viajar con nosotros. ¡Tu Trust Score ha aumentado +2 puntos!";
        
        saveAndSendPush(event.userId(), title, message, "TRUST_SCORE");
    }

    @Async
    @EventListener
    public void handleNoShowEvent(NoShowEvent event) {
        log.warn("[NOTIFICATIONS] Handling NoShowEvent for user {}", event.userId());

        NotificationPreference prefs = getPreferences(event.userId());
        if (!prefs.isNotifyTrustPoints()) return;

        String title = "Inasistencia (NO SHOW)";
        String message = "No te has presentado a tu reserva. Tu Trust Score ha sido penalizado severamente con -10 puntos.";
        
        saveAndSendPush(event.userId(), title, message, "TRUST_SCORE_CRITICAL");
    }

    @Async
    @EventListener
    public void handleTripCancelledEvent(TripCancelledEvent event) {
        log.warn("[NOTIFICATIONS] Handling TripCancelledEvent for trip {}", event.tripId());

        String title = "Viaje Cancelado";
        String message = "El viaje ha sido cancelado debido a un retraso significativo: " + event.reason();

        // 1. Notify the driver
        if (event.driverId() != null) {
            saveAndSendPush(event.driverId(), title, message, "TRIP_CANCELLED");
        }

        // 2. Notify the students
        if (event.studentIds() != null) {
            for (UUID studentId : event.studentIds()) {
                NotificationPreference prefs = getPreferences(studentId);
                if (prefs.isNotifyCancellation()) {
                    saveAndSendPush(studentId, title, message, "TRIP_CANCELLED");
                }
            }
        }
        
        // 3. TODO: Notify administrators if necessary. (Requires a user repository with ADMIN role).
        // For simplicity of the requirement, I assume admins see this on the dashboard.
    }

    @Async
    @EventListener
    public void handleTripReminderEvent(TripReminderEvent event) {
        log.info("[NOTIFICATIONS] Handling TripReminderEvent for trip {}", event.tripId());

        String title = "Recordatorio de Viaje";
        String message = event.minutesRemaining() == 0 
                ? "¡Es hora de empezar tu viaje programado!" 
                : "Faltan " + event.minutesRemaining() + " minutos para iniciar tu viaje programado.";

        if (event.driverId() != null) {
            saveAndSendPush(event.driverId(), title, message, "TRIP_REMINDER");
        }
    }

    @Async
    @EventListener
    public void handleTripDelayedEvent(com.ucebuslink.shared.event.TripDelayedEvent event) {
        log.warn("[NOTIFICATIONS] Handling TripDelayedEvent for trip {}", event.tripId());

        String title = "Alerta de Demora";
        String message = event.reason();

        if (event.driverId() != null) {
            saveAndSendPush(event.driverId(), title, message, "TRIP_DELAYED");
        }
        
        // Students could be notified if the trip is in progress, but for now only the driver is notified.
    }

    private NotificationPreference getPreferences(UUID userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> NotificationPreference.defaultPreferences(userId));
    }

    private void saveAndSendPush(UUID userId, String title, String message, String type) {
        // 1. Save to DB
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        notificationRepository.save(notification);

        // 2. Attempt to send Push if it has a device token
        List<DeviceToken> tokens = deviceTokenRepository.findAllByUserId(userId);
        for (DeviceToken token : tokens) {
            fcmAdapter.sendPushNotification(token.getFcmToken(), title, message);
        }
    }
}
