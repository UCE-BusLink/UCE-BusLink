package com.ucebuslink.identity.infrastructure.persistence.repository;

import com.ucebuslink.identity.infrastructure.persistence.entity.TrustScoreJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaTrustScoreRepository extends JpaRepository<TrustScoreJpaEntity, UUID> {
    Optional<TrustScoreJpaEntity> findByUserId(UUID userId);
    java.util.List<TrustScoreJpaEntity> findByScoreLessThan(int score);
}
