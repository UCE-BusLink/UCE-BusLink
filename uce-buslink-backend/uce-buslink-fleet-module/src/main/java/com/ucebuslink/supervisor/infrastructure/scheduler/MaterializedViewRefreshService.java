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

    // Runs every day at 02:00 AM
    @Scheduled(cron = "0 0 2 * * ?")
    public void refreshDailyRouteStats() {
        log.info("[ANALYTICS] Starting concurrent nightly refresh of mv_daily_route_stats...");
        long start = System.currentTimeMillis();

        try {
            repository.refreshMaterializedView();
            log.info("[ANALYTICS] Materialized view successfully refreshed in {} ms", (System.currentTimeMillis() - start));
        } catch (Exception e) {
            log.error("[ANALYTICS] Failed to refresh the materialized view: {}", e.getMessage(), e);
        }
    }
}