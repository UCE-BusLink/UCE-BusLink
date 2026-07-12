-- ==============================================================================
-- V18__Remove_seed_mock_routes.sql
-- Elimina las 5 rutas mock sembradas por V6 (Ruta 1-5), usadas solo en pruebas.
-- route_stops y schedules se eliminan en cascada (ON DELETE CASCADE).
-- Si existieran trips reales contra estas rutas, fk_trips_route
-- (ON DELETE RESTRICT) bloqueara el DELETE en vez de perder datos reales.
-- ==============================================================================

DELETE FROM routes
WHERE id IN (
    '30000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000004',
    '30000000-0000-0000-0000-000000000005'
);
