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
        log.info("[NOTIFICATIONS] Manejando ReservationCreatedEvent para usuario {}", event.userId());
        
        NotificationPreference prefs = getPreferences(event.userId());
        if (!prefs.isNotifyReservationConfirmed()) return;

        String title = "Reserva Confirmada";
        String message = "Tu reserva ha sido confirmada con éxito.";
        
        saveAndSendPush(event.userId(), title, message, "RESERVATION");
    }

    @Async
    @EventListener
    public void handleReservationCancelledEvent(ReservationCancelledEvent event) {
        log.info("[NOTIFICATIONS] Manejando ReservationCancelledEvent para usuario {}", event.userId());

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
        log.info("[NOTIFICATIONS] Manejando BoardingCompletedEvent para usuario {}", event.userId());

        NotificationPreference prefs = getPreferences(event.userId());
        if (!prefs.isNotifyTrustPoints()) return;

        String title = "Abordaje Exitoso";
        String message = "Gracias por viajar con nosotros. ¡Tu Trust Score ha aumentado +2 puntos!";
        
        saveAndSendPush(event.userId(), title, message, "TRUST_SCORE");
    }

    @Async
    @EventListener
    public void handleNoShowEvent(NoShowEvent event) {
        log.warn("[NOTIFICATIONS] Manejando NoShowEvent para usuario {}", event.userId());

        NotificationPreference prefs = getPreferences(event.userId());
        if (!prefs.isNotifyTrustPoints()) return;

        String title = "Inasistencia (NO SHOW)";
        String message = "No te has presentado a tu reserva. Tu Trust Score ha sido penalizado severamente con -10 puntos.";
        
        saveAndSendPush(event.userId(), title, message, "TRUST_SCORE_CRITICAL");
    }

    private NotificationPreference getPreferences(UUID userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> NotificationPreference.defaultPreferences(userId));
    }

    private void saveAndSendPush(UUID userId, String title, String message, String type) {
        // 1. Guardar en DB
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        notificationRepository.save(notification);

        // 2. Intentar enviar Push si tiene device token
        List<DeviceToken> tokens = deviceTokenRepository.findAllByUserId(userId);
        for (DeviceToken token : tokens) {
            fcmAdapter.sendPushNotification(token.getFcmToken(), title, message);
        }
    }
}
