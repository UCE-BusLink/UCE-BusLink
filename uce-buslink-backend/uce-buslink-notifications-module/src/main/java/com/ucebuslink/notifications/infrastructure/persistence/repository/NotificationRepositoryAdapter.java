package com.ucebuslink.notifications.infrastructure.persistence.repository;

import com.ucebuslink.notifications.domain.model.Notification;
import com.ucebuslink.notifications.domain.repository.NotificationRepository;
import com.ucebuslink.notifications.infrastructure.persistence.entity.NotificationJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class NotificationRepositoryAdapter implements NotificationRepository {

    private final JpaNotificationRepository jpaRepository;

    @Override
    public Notification save(Notification notification) {
        NotificationJpaEntity entity = toJpaEntity(notification);
        return toDomainModel(jpaRepository.save(entity));
    }

    @Override
    public Page<Notification> findByUserId(UUID userId, Pageable pageable) {
        return jpaRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toDomainModel);
    }

    private Notification toDomainModel(NotificationJpaEntity entity) {
        if (entity == null) return null;
        return new Notification(
                entity.getId(),
                entity.getUserId(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getType(),
                entity.isRead(),
                entity.getCreatedAt()
        );
    }

    private NotificationJpaEntity toJpaEntity(Notification model) {
        if (model == null) return null;
        NotificationJpaEntity entity = new NotificationJpaEntity();
        entity.setId(model.getId());
        entity.setUserId(model.getUserId());
        entity.setTitle(model.getTitle());
        entity.setMessage(model.getMessage());
        entity.setType(model.getType());
        entity.setRead(model.isRead());
        entity.setCreatedAt(model.getCreatedAt());
        return entity;
    }
}
