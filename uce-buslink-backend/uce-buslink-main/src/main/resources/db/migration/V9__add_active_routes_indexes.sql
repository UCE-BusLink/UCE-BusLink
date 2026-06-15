-- V9__add_active_routes_indexes.sql

-- Index to speed up finding active routes, ignoring soft-deleted ones
CREATE INDEX IF NOT EXISTS idx_routes_is_active ON routes(is_active) WHERE deleted_at IS NULL;

-- Index to speed up finding routes by a specific stop
CREATE INDEX IF NOT EXISTS idx_route_stops_stop_id ON route_stops(stop_id);