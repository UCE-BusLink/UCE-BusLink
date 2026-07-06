package com.ucebuslink.notifications.application.service;

import com.ucebuslink.notifications.application.dto.NotificationDtos.*;
import com.ucebuslink.notifications.domain.model.DeviceToken;
import com.ucebuslink.notifications.domain.model.NotificationPreference;
import com.ucebuslink.notifications.domain.repository.DeviceTokenRepository;
import com.ucebuslink.notifications.domain.repository.NotificationPreferenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class NotificationApplicationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationApplicationService.class);

    private final DeviceTokenRepository deviceTokenRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final com.ucebuslink.notifications.domain.repository.NotificationRepository notificationRepository;

    public NotificationApplicationService(
            DeviceTokenRepository deviceTokenRepository,
            NotificationPreferenceRepository preferenceRepository,
            com.ucebuslink.notifications.domain.repository.NotificationRepository notificationRepository) {
        this.deviceTokenRepository = deviceTokenRepository;
        this.preferenceRepository = preferenceRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public DeviceToken registerDevice(UUID userId, RegisterDeviceRequest request) {
        log.info("[NOTIFICATIONS] Registrando dispositivo {} para el usuario {}", request.platform(), userId);

        // Validar si el token ya existe según regla de negocio
        return deviceTokenRepository.findByFcmToken(request.fcmToken())
                .map(existingToken -> {
                    log.debug("[NOTIFICATIONS] Token existente, actualizando timestamp de actividad.");
                    existingToken.updateActivity();
                    // Si el token cambió de dueño (raro pero posible si cambian de cuenta en el mismo celular)
                    existingToken.setUserId(userId); 
                    return deviceTokenRepository.save(existingToken);
                })
                .orElseGet(() -> {
                    log.debug("[NOTIFICATIONS] Creando nuevo registro de dispositivo.");
                    DeviceToken newToken = DeviceToken.createNew(userId, request.fcmToken(), request.platform());
                    return deviceTokenRepository.save(newToken);
                });
    }

    @Transactional
    public NotificationPreference updatePreferences(UUID userId, UpdatePreferencesRequest request) {
        log.info("[NOTIFICATIONS] Actualizando preferencias para el usuario {}", userId);

        NotificationPreference prefs = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> NotificationPreference.defaultPreferences(userId));

        prefs.setNotifyBusLeaving(request.notificacionesBusSaliendo());
        prefs.setNotifyBusApproaching(request.notificacionesBusProximo());
        prefs.setNotifyReservationConfirmed(request.notificacionesReservaConfirmada());
        prefs.setNotifyCancellation(request.notificacionesCancelacion());
        prefs.setNotifyTrustPoints(request.notificacionesPuntosConfianza());
        prefs.setUpdatedAt(LocalDateTime.now());

        return preferenceRepository.save(prefs);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUserNotifications(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByUserId(userId, pageable)
                .map(n -> new NotificationResponse(
                        n.getId(),
                        n.getTitle(),
                        n.getMessage(),
                        n.getType(),
                        n.isRead(),
                        n.getCreatedAt()
                ));
    }

    @Transactional
    public void unregisterDevice(String fcmToken) {
        log.info("[NOTIFICATIONS] Eliminando registro del dispositivo con token {}", fcmToken);
        deviceTokenRepository.findByFcmToken(fcmToken)
                .ifPresent(deviceTokenRepository::delete);
    }
}