package com.ucebuslink.notifications.application.listener;

import com.ucebuslink.notifications.domain.model.DeviceToken;
import com.ucebuslink.notifications.domain.model.NotificationPreference;
import com.ucebuslink.notifications.domain.repository.DeviceTokenRepository;
import com.ucebuslink.notifications.domain.repository.NotificationPreferenceRepository;
import com.ucebuslink.notifications.infrastructure.external.fcm.FcmNotificationAdapter;
import com.ucebuslink.notifications.infrastructure.persistence.repository.SpringDataDeviceTokenRepository;
import com.ucebuslink.shared.event.ReservationCancelledEvent;
import com.ucebuslink.shared.event.ReservationCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationPreferenceRepository preferenceRepository;
    private final SpringDataDeviceTokenRepository tokenRepository; // Usamos SpringData directo para traer la lista
    private final FcmNotificationAdapter fcmAdapter;

    /**
     * Se dispara DESPUÉS de que la base de datos guarde la reserva con éxito (Commit).
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleReservationCreated(ReservationCreatedEvent event) {
        // NOTA: Asegúrate de agregar userId a tu ReservationCreatedEvent en el Shared Kernel
        UUID userId = event.userId(); 

        log.info("[NOTIFICATIONS] Evento recibido: Reserva Creada para el usuario {}", userId);

        // 1. Verificamos preferencias (Si no tiene, asume las default que tienen true para reservas)
        NotificationPreference prefs = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> NotificationPreference.defaultPreferences(userId));

        if (!prefs.isNotifyReservationConfirmed()) {
            log.debug("[NOTIFICATIONS] Usuario {} tiene las notificaciones de reserva desactivadas. Omitiendo.", userId);
            return;
        }

        // 2. Buscamos todos los dispositivos (celulares/web) de este usuario
        List<com.ucebuslink.notifications.infrastructure.persistence.entity.DeviceTokenJpaEntity> tokens = 
                tokenRepository.findByUserId(userId);

        if (tokens.isEmpty()) {
            log.warn("[NOTIFICATIONS] Usuario {} no tiene tokens FCM registrados.", userId);
            return;
        }

        // 3. Enviamos el Push a todos sus dispositivos
        for (var device : tokens) {
            fcmAdapter.sendPushNotification(
                    device.getFcmToken(), 
                    "¡Reserva Confirmada! ✅", 
                    "Tu asiento para el viaje ha sido asegurado. Abre la app para ver tu código QR."
            );
        }
    }
}