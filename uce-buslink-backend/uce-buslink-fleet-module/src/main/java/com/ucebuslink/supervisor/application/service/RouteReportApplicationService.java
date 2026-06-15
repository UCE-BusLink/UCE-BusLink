package com.ucebuslink.supervisor.application.service;

import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.infrastructure.persistence.projection.DailyRouteStatsProjection;
import com.ucebuslink.supervisor.infrastructure.persistence.repository.DailyRouteStatsRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RouteReportApplicationService {

    private static final Logger log = LoggerFactory.getLogger(RouteReportApplicationService.class);
    private final DailyRouteStatsRepository repository;

    public RouteReportApplicationService(DailyRouteStatsRepository repository) {
        this.repository = repository;
    }

    // Crucial: readOnly = true optimiza el uso de memoria en Hibernate al no hacer flush()
    @Transactional(readOnly = true)
    public PageResponse<DailyRouteStatsProjection> getDailyRouteStatistics(int page, int size) {
        log.info("Fetching historical daily route statistics. Page: {}, Size: {}", page, size);
        
        Page<DailyRouteStatsProjection> statsPage = repository.findAllStats(PageRequest.of(page, size));
        List<DailyRouteStatsProjection> content = statsPage.getContent();
        
        log.debug("Retrieved {} statistical records from materialized view", content.size());
        
        return new PageResponse<>(
                content,
                statsPage.getNumber(),
                statsPage.getSize(),
                statsPage.getTotalElements(),
                statsPage.getTotalPages()
        );
    }
}