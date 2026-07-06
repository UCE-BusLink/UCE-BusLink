package com.ucebuslink.identity.infrastructure.persistence.repository;

import com.ucebuslink.identity.domain.model.TrustPenalty;
import com.ucebuslink.identity.domain.model.TrustScore;
import com.ucebuslink.identity.domain.repository.TrustScoreRepository;
import com.ucebuslink.identity.infrastructure.persistence.entity.TrustPenaltyJpaEntity;
import com.ucebuslink.identity.infrastructure.persistence.entity.TrustScoreJpaEntity;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TrustScoreRepositoryAdapter implements TrustScoreRepository {

    private final JpaTrustScoreRepository jpaRepository;

    public TrustScoreRepositoryAdapter(JpaTrustScoreRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Optional<TrustScore> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).map(this::toDomainModel);
    }

    @Override
    public List<TrustScore> findByScoreLessThan(int score) {
        return jpaRepository.findByScoreLessThan(score).stream()
                .map(this::toDomainModel)
                .collect(Collectors.toList());
    }

    @Override
    public TrustScore save(TrustScore trustScore) {
        TrustScoreJpaEntity entity = toJpaEntity(trustScore);
        
        if (entity.getPenalties() != null) {
            entity.getPenalties().forEach(p -> p.setTrustScore(entity));
        }

        TrustScoreJpaEntity saved = jpaRepository.save(entity);
        return toDomainModel(saved);
    }

    private TrustScore toDomainModel(TrustScoreJpaEntity entity) {
        if (entity == null) return null;
        
        TrustScore score = new TrustScore(
                entity.getId(),
                entity.getUserId(),
                entity.getScore(),
                entity.getLevel(),
                entity.getTotalReservations(),
                entity.getCompletedReservations(),
                entity.getNoShows(),
                entity.getCancellationsLast30Days(),
                entity.getTrendLast7Days(),
                entity.getNextReviewAt(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                null
        );

        if (entity.getPenalties() != null) {
            score.setActivePenalties(entity.getPenalties().stream()
                    .map(p -> new TrustPenalty(
                            p.getId(),
                            p.getTrustScore().getId(),
                            p.getType(),
                            p.getReason(),
                            p.getPointsRemoved(),
                            p.getStartsAt(),
                            p.getExpiresAt(),
                            p.getStatus(),
                            p.getCreatedAt()
                    )).collect(Collectors.toList()));
        }

        return score;
    }

    private TrustScoreJpaEntity toJpaEntity(TrustScore model) {
        if (model == null) return null;
        
        TrustScoreJpaEntity entity = TrustScoreJpaEntity.builder()
                .id(model.getId())
                .userId(model.getUserId())
                .score(model.getScore())
                .level(model.getLevel())
                .totalReservations(model.getTotalReservations())
                .completedReservations(model.getCompletedReservations())
                .noShows(model.getNoShows())
                .cancellationsLast30Days(model.getCancellationsLast30Days())
                .trendLast7Days(model.getTrendLast7Days())
                .nextReviewAt(model.getNextReviewAt())
                .createdAt(model.getCreatedAt())
                .updatedAt(model.getUpdatedAt())
                .build();

        if (model.getActivePenalties() != null) {
            entity.setPenalties(model.getActivePenalties().stream()
                    .map(p -> TrustPenaltyJpaEntity.builder()
                            .id(p.getId())
                            .trustScore(entity)
                            .type(p.getType())
                            .reason(p.getReason())
                            .pointsRemoved(p.getPointsRemoved())
                            .startsAt(p.getStartsAt())
                            .expiresAt(p.getExpiresAt())
                            .status(p.getStatus())
                            .createdAt(p.getCreatedAt())
                            .build()
                    ).collect(Collectors.toList()));
        }

        return entity;
    }
}
