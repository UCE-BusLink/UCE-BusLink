package com.ucebuslink.notifications.domain.repository;

import com.ucebuslink.notifications.domain.model.DeviceToken;
import java.util.Optional;

public interface DeviceTokenRepository {
    DeviceToken save(DeviceToken token);
    Optional<DeviceToken> findByFcmToken(String fcmToken);
}