package com.ucebuslink.supervisor.infrastructure.persistence.projection;

import java.util.Date;
import java.util.UUID;

// Interfaz plana para mapear los resultados del Native Query de PostgreSQL
public interface DailyRouteStatsProjection {
    UUID getRoute_id();
    String getRoute_name();
    Date getOperation_date();
    Integer getTotal_trips();
    Integer getCompleted_trips();
    Integer getCancelled_trips();
    Integer getTotal_reservations();
    Integer getTotal_boardings();
    Integer getTotal_incidents();
}