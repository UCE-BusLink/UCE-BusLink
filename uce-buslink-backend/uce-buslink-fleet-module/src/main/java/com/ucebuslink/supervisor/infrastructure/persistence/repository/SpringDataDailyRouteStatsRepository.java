package com.ucebuslink.supervisor.infrastructure.persistence.repository;

import com.ucebuslink.supervisor.infrastructure.persistence.entity.DailyRouteStatsJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataDailyRouteStatsRepository extends JpaRepository<DailyRouteStatsJpaEntity, UUID> {
    
    // Método para el dashboard: "Traer las estadísticas de este mes"
    List<DailyRouteStatsJpaEntity> findByStatDateBetween(LocalDate startDate, LocalDate endDate);
}