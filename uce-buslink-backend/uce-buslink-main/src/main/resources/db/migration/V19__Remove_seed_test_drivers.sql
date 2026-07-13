-- ==============================================================================
-- V19__Remove_seed_test_drivers.sql
-- Elimina los choferes de prueba sembrados por V4 y V6 (y por el antiguo
-- DriverDataSeeder). Solo deben existir los choferes creados por el admin.
-- El guard NOT EXISTS evita violar los FKs ON DELETE RESTRICT (trips,
-- audit_logs, trip_incidents, reservations) en entornos donde estos usuarios
-- ya tengan actividad real asociada.
-- ==============================================================================

DELETE FROM users u
WHERE u.email IN (
    'conductor1@uce.edu.ec',
    'conductor2@uce.edu.ec',
    'carlos.driver@uce.edu.ec',
    'luis.driver@uce.edu.ec'
)
AND NOT EXISTS (SELECT 1 FROM trips t WHERE t.driver_id = u.id)
AND NOT EXISTS (SELECT 1 FROM audit_logs a WHERE a.user_id = u.id)
AND NOT EXISTS (SELECT 1 FROM trip_incidents i WHERE i.reported_by_user_id = u.id)
AND NOT EXISTS (SELECT 1 FROM reservations r WHERE r.user_id = u.id);
