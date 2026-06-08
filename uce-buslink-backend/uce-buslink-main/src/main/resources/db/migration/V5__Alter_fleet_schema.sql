-- ==============================================================================
-- V5: Actualización del esquema de Flota y Rutas
-- Añade campos necesarios identificados en los DTOs de integración
-- ==============================================================================

-- 1. Añadir soporte para el trazado de mapas en la tabla routes
ALTER TABLE routes 
ADD COLUMN path_polyline TEXT;

-- 2. Añadir tiempo de detención por parada en la tabla route_stops
ALTER TABLE route_stops 
ADD COLUMN stop_duration_minutes INTEGER NOT NULL DEFAULT 0;

-- Añadir el constraint de validación (CHECK) para que no haya tiempos negativos
ALTER TABLE route_stops 
ADD CONSTRAINT chk_stop_duration_positive CHECK (stop_duration_minutes >= 0);

-- 3. Añadir el año de fabricación en la tabla buses
ALTER TABLE buses 
ADD COLUMN manufacturing_year INTEGER;