package com.ucebuslink.notifications.infrastructure.persistence.repository;

import com.ucebuslink.notifications.infrastructure.persistence.entity.DeviceTokenJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataDeviceTokenRepository extends JpaRepository<DeviceTokenJpaEntity, UUID> {
    List<DeviceTokenJpaEntity> findByUserId(UUID userId);
    Optional<DeviceTokenJpaEntity> findByFcmToken(String fcmToken);
}