
-- ==============================================================================
-- V6__Seed_massive_fleet_data.sql
-- Seed masivo corregido y consistente
-- Compatible con PostgreSQL + Flyway
-- ==============================================================================

-- ==============================================================================
-- 1. USERS (Conductores)
-- ==============================================================================

INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    role,
    status,
    password_hash,
    created_at,
    updated_at
)
VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'carlos.driver@uce.edu.ec',
    'Carlos',
    'Conductor',
    'DRIVER',
    'ACTIVE',
    '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjQgG.oG/u',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '10000000-0000-0000-0000-000000000002',
    'luis.driver@uce.edu.ec',
    'Luis',
    'Volante',
    'DRIVER',
    'ACTIVE',
    '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjQgG.oG/u',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- ==============================================================================
-- 2. STOPS
-- ==============================================================================

INSERT INTO stops (
    id,
    name,
    latitude,
    longitude,
    is_active,
    created_at
)
VALUES
('20000000-0000-0000-0000-000000000001', 'Facultad de Artes', -0.1995, -78.5050, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000002', 'Estadio Universitario', -0.1983, -78.5034, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000003', 'Facultad de Odontología', -0.1970, -78.5020, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000004', 'Facultad de Jurisprudencia', -0.2001, -78.5042, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000005', 'Hospital del Día UCE', -0.1965, -78.5011, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000006', 'Teatro Universitario', -0.1988, -78.5066, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000007', 'Facultad de Economía', -0.2010, -78.5030, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000008', 'Instituto de Idiomas', -0.2025, -78.5015, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000009', 'Residencia Universitaria', -0.1950, -78.5005, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000010', 'Facultad de Ingeniería', -0.2035, -78.5045, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000011', 'Facultad de Arquitectura', -0.2040, -78.5060, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000012', 'Facultad de Medicina', -0.1945, -78.4980, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000013', 'Centro de Biología', -0.1930, -78.4975, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000014', 'Entrada Av. América', -0.1990, -78.4990, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000015', 'Entrada Av. Universitaria', -0.2015, -78.5070, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000016', 'Facultad de Comunicación', -0.2050, -78.5020, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000017', 'Canchas Múltiples', -0.1975, -78.5080, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000018', 'Parqueadero Central', -0.2005, -78.5055, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000019', 'Facultad de Ciencias', -0.2060, -78.5035, true, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000020', 'Administración Central', -0.1998, -78.5038, true, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 3. ROUTES
-- ==============================================================================

INSERT INTO routes (
    id,
    name,
    description,
    is_active,
    estimated_duration_minutes,
    path_polyline,
    created_at,
    updated_at
)
VALUES
(
    '30000000-0000-0000-0000-000000000001',
    'Ruta 1: Perimetral UCE',
    'Ruta que bordea el campus',
    true,
    45,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '30000000-0000-0000-0000-000000000002',
    'Ruta 2: Facultades Salud',
    'Conecta Medicina, Odontología y Hospital',
    true,
    22,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '30000000-0000-0000-0000-000000000003',
    'Ruta 3: Ingeniería y Arquitectura',
    'Zona técnica norte',
    true,
    32,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '30000000-0000-0000-0000-000000000004',
    'Ruta 4: Administrativa',
    'Conecta administración y accesos principales',
    true,
    12,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '30000000-0000-0000-0000-000000000005',
    'Ruta 5: Nocturna Segura',
    'Ruta de circulación nocturna',
    true,
    28,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 4. ROUTE STOPS
-- ==============================================================================

INSERT INTO route_stops (
    route_id,
    stop_id,
    stop_order,
    estimated_minutes_from_start,
    stop_duration_minutes,
    created_at
)
VALUES

-- ==========================================================================
-- Ruta 1
-- Duración total real: 45 min
-- ==========================================================================

('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000014',1,0,2,CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002',2,8,3,CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000006',3,18,2,CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000015',4,30,2,CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000018',5,40,5,CURRENT_TIMESTAMP),

-- ==========================================================================
-- Ruta 2
-- Duración total real: 22 min
-- ==========================================================================

('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000012',1,0,2,CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003',2,8,3,CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000005',3,18,2,CURRENT_TIMESTAMP),

-- ==========================================================================
-- Ruta 3
-- Duración total real: 32 min
-- ==========================================================================

('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000010',1,0,2,CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000011',2,10,3,CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000016',3,20,2,CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000019',4,30,2,CURRENT_TIMESTAMP),

-- ==========================================================================
-- Ruta 4
-- Duración total real: 12 min
-- ==========================================================================

('30000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000020',1,0,2,CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000014',2,5,2,CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000018',3,10,2,CURRENT_TIMESTAMP),

-- ==========================================================================
-- Ruta 5
-- Duración total real: 28 min
-- ==========================================================================

('30000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000015',1,0,2,CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000006',2,8,2,CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000020',3,16,2,CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000002',4,25,3,CURRENT_TIMESTAMP)

ON CONFLICT (route_id, stop_id) DO NOTHING;

-- ==============================================================================
-- FIN
-- ==============================================================================