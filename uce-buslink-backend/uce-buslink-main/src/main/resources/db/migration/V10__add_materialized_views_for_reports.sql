-- V10__add_materialized_views_for_reports.sql

-- Creamos la vista materializada para estadísticas diarias por ruta
CREATE MATERIALIZED VIEW mv_daily_route_stats AS
SELECT 
    t.route_id,
    r.name AS route_name,
    DATE(t.departure_time) AS operation_date,
    COUNT(t.id) AS total_trips,
    COUNT(t.id) FILTER (WHERE t.state = 'COMPLETED') AS completed_trips,
    COUNT(t.id) FILTER (WHERE t.state = 'CANCELLED') AS cancelled_trips,
    COALESCE(SUM(res_count.total_reservations), 0) AS total_reservations,
    COALESCE(SUM(res_count.total_boardings), 0) AS total_boardings,
    COALESCE(SUM(inc_count.total_incidents), 0) AS total_incidents
FROM trips t
JOIN routes r ON t.route_id = r.id
LEFT JOIN (
    -- Subquery para contar reservas y abordajes reales por viaje
    SELECT 
        trip_id, 
        COUNT(id) AS total_reservations,
        COUNT(id) FILTER (WHERE boarded_at IS NOT NULL) AS total_boardings
    FROM reservations
    WHERE status != 'CANCELLED'
    GROUP BY trip_id
) res_count ON t.id = res_count.trip_id
LEFT JOIN (
    -- Subquery para contar incidentes por viaje
    SELECT 
        trip_id, 
        COUNT(id) AS total_incidents
    FROM trip_incidents
    GROUP BY trip_id
) inc_count ON t.id = inc_count.trip_id
WHERE t.deleted_at IS NULL
GROUP BY t.route_id, r.name, DATE(t.departure_time);

-- Índice único REQUERIDO para poder hacer refrescos concurrentes (CONCURRENTLY)
CREATE UNIQUE INDEX idx_mv_daily_route_stats_unique 
ON mv_daily_route_stats(route_id, operation_date);

-- Índice para búsquedas rápidas por fecha
CREATE INDEX idx_mv_daily_route_stats_date 
ON mv_daily_route_stats(operation_date DESC);