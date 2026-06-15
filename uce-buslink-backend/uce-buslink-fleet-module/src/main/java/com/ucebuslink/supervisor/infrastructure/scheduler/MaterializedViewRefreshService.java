package com.ucebuslink.supervisor.infrastructure.scheduler;

import com.ucebuslink.supervisor.infrastructure.persistence.repository.DailyRouteStatsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class MaterializedViewRefreshService {

    private static final Logger log = LoggerFactory.getLogger(MaterializedViewRefreshService.class);
    private final DailyRouteStatsRepository repository;

    public MaterializedViewRefreshService(DailyRouteStatsRepository repository) {
        this.repository = repository;
    }

    // Se ejecuta todos los días a las 02:00 AM
    @Scheduled(cron = "0 0 2 * * ?")
    public void refreshDailyRouteStats() {
        log.info("Starting scheduled CONCURRENT refresh of mv_daily_route_stats...");
        long start = System.currentTimeMillis();
        
        try {
            repository.refreshMaterializedView();
            log.info("Successfully refreshed materialized view in {} ms", (System.currentTimeMillis() - start));
        } catch (Exception e) {
            log.error("Failed to refresh materialized view: {}", e.getMessage(), e);
        }
    }
}