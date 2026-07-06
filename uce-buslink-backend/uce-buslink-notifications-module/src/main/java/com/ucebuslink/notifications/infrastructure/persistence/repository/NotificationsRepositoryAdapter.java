package com.ucebuslink.notifications.infrastructure.persistence.repository;

import com.ucebuslink.notifications.domain.model.DeviceToken;
import com.ucebuslink.notifications.domain.model.NotificationPreference;
import com.ucebuslink.notifications.domain.repository.DeviceTokenRepository;
import com.ucebuslink.notifications.domain.repository.NotificationPreferenceRepository;
import com.ucebuslink.notifications.infrastructure.persistence.entity.DeviceTokenJpaEntity;
import com.ucebuslink.notifications.infrastructure.persistence.entity.NotificationPreferenceJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class NotificationsRepositoryAdapter implements DeviceTokenRepository, NotificationPreferenceRepository {

    private final SpringDataDeviceTokenRepository tokenRepository;
    private final SpringDataNotificationPreferenceRepository prefRepository;

    @Override
    public DeviceToken save(DeviceToken token) {
        DeviceTokenJpaEntity entity = new DeviceTokenJpaEntity();
        entity.setId(token.getId());
        entity.setUserId(token.getUserId());
        entity.setFcmToken(token.getFcmToken());
        entity.setPlatform(token.getPlatform());
        entity.setCreatedAt(token.getCreatedAt());
        entity.setLastActiveAt(token.getLastActiveAt());
        
        tokenRepository.save(entity);
        return token;
    }

    @Override
    public Optional<DeviceToken> findByFcmToken(String fcmToken) {
        return tokenRepository.findByFcmToken(fcmToken).map(entity -> 
            new DeviceToken(entity.getId(), entity.getUserId(), entity.getFcmToken(), 
                    entity.getPlatform(), entity.getCreatedAt(), entity.getLastActiveAt()));
    }

    @Override
    public void delete(DeviceToken token) {
        tokenRepository.deleteById(token.getId());
    }

    @Override
    public List<DeviceToken> findAllByUserId(UUID userId) {
        return tokenRepository.findByUserId(userId).stream()
                .map(entity -> new DeviceToken(entity.getId(), entity.getUserId(), entity.getFcmToken(), 
                    entity.getPlatform(), entity.getCreatedAt(), entity.getLastActiveAt()))
                .collect(Collectors.toList());
    }

    @Override
    public NotificationPreference save(NotificationPreference pref) {
        NotificationPreferenceJpaEntity entity = new NotificationPreferenceJpaEntity();
        entity.setId(pref.getId());
        entity.setUserId(pref.getUserId());
        entity.setNotifyBusLeaving(pref.isNotifyBusLeaving());
        entity.setNotifyBusApproaching(pref.isNotifyBusApproaching());
        entity.setNotifyReservationConfirmed(pref.isNotifyReservationConfirmed());
        entity.setNotifyCancellation(pref.isNotifyCancellation());
        entity.setNotifyTrustPoints(pref.isNotifyTrustPoints());
        entity.setUpdatedAt(pref.getUpdatedAt());
        
        prefRepository.save(entity);
        return pref;
    }

    @Override
    public Optional<NotificationPreference> findByUserId(UUID userId) {
        return prefRepository.findByUserId(userId).map(entity -> 
            new NotificationPreference(entity.getId(), entity.getUserId(), entity.isNotifyBusLeaving(),
                    entity.isNotifyBusApproaching(), entity.isNotifyReservationConfirmed(),
                    entity.isNotifyCancellation(), entity.isNotifyTrustPoints(), entity.getUpdatedAt()));
    }
}