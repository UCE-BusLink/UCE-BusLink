package com.ucebuslink.supervisor.infrastructure.persistence.repository;

import com.ucebuslink.supervisor.infrastructure.persistence.entity.RouteJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SpringDataRouteRepository extends JpaRepository<RouteJpaEntity, UUID> {
    Optional<RouteJpaEntity> findByIdAndDeletedAtIsNull(UUID id);

    Page<RouteJpaEntity> findByDeletedAtIsNullAndIsActive(Boolean isActive, Pageable pageable);

    @Query("SELECT r FROM RouteJpaEntity r WHERE r.deletedAt IS NULL AND r.isActive = true")
    List<RouteJpaEntity> findAllActiveRoutes();
}