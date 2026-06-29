package com.ucebuslink.notifications.application.service;

import com.ucebuslink.notifications.domain.model.NotificationPreference;
import com.ucebuslink.notifications.domain.repository.NotificationPreferenceRepository;
import com.ucebuslink.notifications.infrastructure.external.fcm.FcmNotificationAdapter;
import com.ucebuslink.notifications.infrastructure.persistence.entity.DeviceTokenJpaEntity;
import com.ucebuslink.notifications.infrastructure.persistence.repository.SpringDataDeviceTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.function.Predicate;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationDispatcherService {

    private final NotificationPreferenceRepository preferenceRepository;
    private final SpringDataDeviceTokenRepository tokenRepository;
    private final FcmNotificationAdapter fcmAdapter;

    /**
     * @param userId
     * @param title
     * @param body
     * @param preferenceCheck 
     */
    @Transactional(readOnly = true)
    public void dispatch(UUID userId, String title, String body, Predicate<NotificationPreference> preferenceCheck) {
        
        // 1. Obtener preferencias (o defaults si no tiene)
        NotificationPreference prefs = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> NotificationPreference.defaultPreferences(userId));

        // 2. Evaluar si quiere recibir este TIPO de notificación
        if (!preferenceCheck.test(prefs)) {
            log.debug("[NOTIFICATIONS] Envío cancelado por preferencias del usuario {}", userId);
            return;
        }

        // 3. Buscar sus dispositivos
        List<DeviceTokenJpaEntity> tokens = tokenRepository.findByUserId(userId);
        if (tokens.isEmpty()) {
            return;
        }

        // 4. Enviar a todos sus dispositivos
        for (DeviceTokenJpaEntity device : tokens) {
            fcmAdapter.sendPushNotification(device.getFcmToken(), title, body);
        }
    }
}