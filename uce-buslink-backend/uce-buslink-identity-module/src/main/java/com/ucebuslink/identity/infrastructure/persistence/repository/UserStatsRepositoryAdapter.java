package com.ucebuslink.identity.infrastructure.persistence.repository;

import com.ucebuslink.identity.domain.model.UserStats;
import com.ucebuslink.identity.domain.repository.UserStatsRepository;
import com.ucebuslink.identity.infrastructure.persistence.entity.UserStatsJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserStatsRepositoryAdapter implements UserStatsRepository {

    private final JpaUserStatsRepository jpaRepository;

    @Override
    public Optional<UserStats> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).map(this::toDomain);
    }

    @Override
    public UserStats save(UserStats userStats) {
        UserStatsJpaEntity entity = toEntity(userStats);
        UserStatsJpaEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    private UserStats toDomain(UserStatsJpaEntity entity) {
        return UserStats.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .totalTrips(entity.getTotalTrips())
                .completedTrips(entity.getCompletedTrips())
                .totalDistanceKm(entity.getTotalDistanceKm())
                .totalHoursTransit(entity.getTotalHoursTransit())
                .activeDays(entity.getActiveDays())
                .build();
    }

    private UserStatsJpaEntity toEntity(UserStats domain) {
        return UserStatsJpaEntity.builder()
                .id(domain.getId())
                .userId(domain.getUserId())
                .totalTrips(domain.getTotalTrips())
                .completedTrips(domain.getCompletedTrips())
                .totalDistanceKm(domain.getTotalDistanceKm())
                .totalHoursTransit(domain.getTotalHoursTransit())
                .activeDays(domain.getActiveDays())
                .build();
    }
}
