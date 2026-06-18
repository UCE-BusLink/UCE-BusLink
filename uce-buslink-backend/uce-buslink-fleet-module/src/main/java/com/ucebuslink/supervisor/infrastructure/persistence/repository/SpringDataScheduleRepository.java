package com.ucebuslink.supervisor.infrastructure.persistence.repository;

import com.ucebuslink.supervisor.infrastructure.persistence.entity.ScheduleJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataScheduleRepository extends JpaRepository<ScheduleJpaEntity, UUID> {
    List<ScheduleJpaEntity> findByRouteId(UUID routeId);
}