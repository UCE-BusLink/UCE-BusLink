-- 1. Crear la Vista Materializada para estadísticas diarias por ruta
CREATE MATERIALIZED VIEW daily_route_stats AS
SELECT
    r.id AS route_id,
    r.name AS route_name,
    DATE(t.departure_time) AS stat_date,
    COUNT(t.id) AS total_scheduled_trips,
    SUM(CASE WHEN t.state = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_trips,
    SUM(CASE WHEN t.state = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_trips,
    COALESCE(
        CAST(AVG(b.seat_capacity - t.available_seats) AS double precision),
        0
    ) AS average_occupied_seats
FROM routes r
JOIN trips t ON r.id = t.route_id
JOIN buses b ON t.bus_id = b.id
GROUP BY r.id, r.name, DATE(t.departure_time);

-- 2. Crear índices para búsquedas ultra rápidas en el dashboard gerencial
CREATE UNIQUE INDEX idx_daily_route_stats_unique
ON daily_route_stats (route_id, stat_date);

CREATE INDEX idx_daily_route_stats_date
ON daily_route_stats (stat_date);