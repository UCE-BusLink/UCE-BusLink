package com.ucebuslink.notifications.domain.repository;

import com.ucebuslink.notifications.domain.model.NotificationPreference;
import java.util.Optional;
import java.util.UUID;

public interface NotificationPreferenceRepository {
    NotificationPreference save(NotificationPreference preference);
    Optional<NotificationPreference> findByUserId(UUID userId);
}