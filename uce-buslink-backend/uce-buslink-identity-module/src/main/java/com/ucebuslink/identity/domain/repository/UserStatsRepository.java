package com.ucebuslink.identity.domain.repository;

import com.ucebuslink.identity.domain.model.UserStats;
import java.util.Optional;
import java.util.UUID;

public interface UserStatsRepository {
    Optional<UserStats> findByUserId(UUID userId);
    UserStats save(UserStats userStats);
}
