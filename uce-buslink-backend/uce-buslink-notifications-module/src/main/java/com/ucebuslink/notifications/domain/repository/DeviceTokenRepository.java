package com.ucebuslink.notifications.domain.repository;

import com.ucebuslink.notifications.domain.model.DeviceToken;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeviceTokenRepository {
    DeviceToken save(DeviceToken token);
    Optional<DeviceToken> findByFcmToken(String fcmToken);
    List<DeviceToken> findAllByUserId(UUID userId);
    void delete(DeviceToken token);
}