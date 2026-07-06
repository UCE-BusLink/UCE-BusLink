package com.ucebuslink.identity.domain.repository;

import com.ucebuslink.identity.domain.model.TrustScore;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface TrustScoreRepository {
    Optional<TrustScore> findByUserId(UUID userId);
    List<TrustScore> findByScoreLessThan(int score);
    TrustScore save(TrustScore trustScore);
}
