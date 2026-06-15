package com.ucebuslink.supervisor.adapters.input.http;

import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.application.service.RouteReportApplicationService;
import com.ucebuslink.supervisor.infrastructure.persistence.projection.DailyRouteStatsProjection;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/supervisor/reports")
public class ReportController {

    private static final Logger log = LoggerFactory.getLogger(ReportController.class);
    
    private final RouteReportApplicationService reportService;

    public ReportController(RouteReportApplicationService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/routes/daily")
    // Aseguramos que solo los administradores puedan acceder a las estadísticas
    @PreAuthorize("hasRole('ADMIN')") 
    public ResponseEntity<PageResponse<DailyRouteStatsProjection>> getDailyRouteStats(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("REST request to get daily route statistics - Page: {}, Size: {}", page, size);
        
        PageResponse<DailyRouteStatsProjection> response = reportService.getDailyRouteStatistics(page, size);
        
        log.debug("Returning {} report records to client", response.content().size());
        return ResponseEntity.ok(response);
    }
}