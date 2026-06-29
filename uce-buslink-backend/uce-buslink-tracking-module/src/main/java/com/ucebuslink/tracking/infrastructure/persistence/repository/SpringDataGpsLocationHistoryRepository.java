package com.ucebuslink.tracking.infrastructure.persistence.repository;

import com.ucebuslink.tracking.infrastructure.persistence.entity.GpsLocationHistoryJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SpringDataGpsLocationHistoryRepository extends JpaRepository<GpsLocationHistoryJpaEntity, UUID> {
}