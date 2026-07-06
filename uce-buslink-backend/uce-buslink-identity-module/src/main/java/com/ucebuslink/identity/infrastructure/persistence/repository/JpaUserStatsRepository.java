package com.ucebuslink.identity.infrastructure.persistence.repository;

import com.ucebuslink.identity.infrastructure.persistence.entity.UserStatsJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaUserStatsRepository extends JpaRepository<UserStatsJpaEntity, UUID> {
    Optional<UserStatsJpaEntity> findByUserId(UUID userId);
}
