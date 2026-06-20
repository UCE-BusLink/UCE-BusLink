package com.ucebuslink.supervisor.infrastructure.persistence.repository;

import com.ucebuslink.supervisor.infrastructure.persistence.entity.StopJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

public interface SpringDataStopRepository extends JpaRepository<StopJpaEntity, UUID> {
    @Query("SELECT s FROM StopJpaEntity s WHERE s.deletedAt IS NULL AND s.isActive = true")
    List<StopJpaEntity> findAllActiveStops();

    Page<StopJpaEntity> findByDeletedAtIsNullAndIsActive(boolean isActive, Pageable pageable);
}