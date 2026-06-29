package com.ucebuslink.notifications.infrastructure.persistence.repository;

import com.ucebuslink.notifications.infrastructure.persistence.entity.NotificationPreferenceJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataNotificationPreferenceRepository extends JpaRepository<NotificationPreferenceJpaEntity, UUID> {
    Optional<NotificationPreferenceJpaEntity> findByUserId(UUID userId);
}