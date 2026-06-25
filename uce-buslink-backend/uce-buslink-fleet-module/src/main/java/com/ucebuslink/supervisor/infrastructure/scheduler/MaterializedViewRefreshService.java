package com.ucebuslink.supervisor.infrastructure.scheduler;

import com.ucebuslink.supervisor.infrastructure.persistence.repository.DailyRouteStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaterializedViewRefreshService {

    private final DailyRouteStatsRepository repository;

    // Se ejecuta todos los días a las 02:00 AM
    @Scheduled(cron = "0 * * * * ?")
    public void refreshDailyRouteStats() {
        log.info("[ANALYTICS] Iniciando actualización nocturna concurrente de mv_daily_route_stats...");
        long start = System.currentTimeMillis();
        
        try {
            repository.refreshMaterializedView();
            log.info("[ANALYTICS] Vista materializada actualizada exitosamente en {} ms", (System.currentTimeMillis() - start));
        } catch (Exception e) {
            log.error("[ANALYTICS] Fallo al actualizar la vista materializada: {}", e.getMessage(), e);
        }
    }
}