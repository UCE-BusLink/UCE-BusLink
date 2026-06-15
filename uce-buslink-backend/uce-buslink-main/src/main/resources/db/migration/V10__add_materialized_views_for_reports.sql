-- V10__add_materialized_views_for_reports.sql

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
    COALESCE(SUM(res_count.cancelled_by_student), 0) AS cancelled_by_student,
    COALESCE(SUM(res_count.cancelled_by_admin), 0) AS cancelled_by_admin,
    COALESCE(SUM(res_count.no_shows), 0) AS no_shows,
    COALESCE(SUM(inc_count.total_incidents), 0) AS total_incidents
FROM trips t
JOIN routes r ON t.route_id = r.id
LEFT JOIN (
    -- Subquery actualizada con los nuevos ENUMs
    SELECT 
        trip_id, 
        COUNT(id) AS total_reservations,
        COUNT(id) FILTER (WHERE boarded_at IS NOT NULL OR status = 'COMPLETED') AS total_boardings,
        COUNT(id) FILTER (WHERE status = 'CANCELLED_BY_STUDENT') AS cancelled_by_student,
        COUNT(id) FILTER (WHERE status = 'CANCELLED_BY_ADMIN') AS cancelled_by_admin,
        COUNT(id) FILTER (WHERE status = 'NO_SHOW') AS no_shows
    FROM reservations
    GROUP BY trip_id
) res_count ON t.id = res_count.trip_id
LEFT JOIN (
    SELECT 
        trip_id, 
        COUNT(id) AS total_incidents
    FROM trip_incidents
    GROUP BY trip_id
) inc_count ON t.id = inc_count.trip_id
WHERE t.deleted_at IS NULL
GROUP BY t.route_id, r.name, DATE(t.departure_time);

CREATE UNIQUE INDEX idx_mv_daily_route_stats_unique 
ON mv_daily_route_stats(route_id, operation_date);

CREATE INDEX idx_mv_daily_route_stats_date 
ON mv_daily_route_stats(operation_date DESC);