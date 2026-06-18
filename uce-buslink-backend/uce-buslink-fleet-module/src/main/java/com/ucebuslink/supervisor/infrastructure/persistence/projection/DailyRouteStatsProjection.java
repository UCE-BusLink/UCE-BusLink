package com.ucebuslink.supervisor.infrastructure.persistence.projection;

import java.util.Date;
import java.util.UUID;

public interface DailyRouteStatsProjection {
    UUID getRoute_id();
    String getRoute_name();
    Date getOperation_date();
    Integer getTotal_trips();
    Integer getCompleted_trips();
    Integer getCancelled_trips();
    Integer getTotal_reservations();
    Integer getTotal_boardings();
    
    // Agregamos los nuevos contadores del ENUM
    Integer getCancelled_by_student();
    Integer getCancelled_by_admin();
    Integer getNo_shows();
    
    Integer getTotal_incidents();
}