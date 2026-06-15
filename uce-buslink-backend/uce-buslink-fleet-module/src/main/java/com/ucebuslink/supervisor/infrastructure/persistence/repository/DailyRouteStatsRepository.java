package com.ucebuslink.supervisor.infrastructure.persistence.repository;

import com.ucebuslink.supervisor.infrastructure.persistence.projection.DailyRouteStatsProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

// Extendemos de Repository base para no heredar métodos CRUD innecesarios
public interface DailyRouteStatsRepository extends Repository<DailyRouteStatsProjection, UUID> {

    @Query(value = "SELECT * FROM mv_daily_route_stats ORDER BY operation_date DESC",
           countQuery = "SELECT count(*) FROM mv_daily_route_stats",
           nativeQuery = true)
    Page<DailyRouteStatsProjection> findAllStats(Pageable pageable);

    @Modifying
    @Transactional
    @Query(value = "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_route_stats", nativeQuery = true)
    void refreshMaterializedView();
}