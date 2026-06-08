-- ==============================================================================
-- 1. Habilitar extensión criptográfica de PostgreSQL
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- 2. Añadir nuevas columnas a la tabla users
-- ==============================================================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS lockout_expiration TIMESTAMP;

-- ==============================================================================
-- 3. Seeder: Administrador por defecto
-- Contraseña: admin123
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
    failed_login_attempts
)
VALUES (
    gen_random_uuid(),
    'admin@uce.edu.ec',
    'Admin',
    'Sistema',
    'ADMIN',
    'ACTIVE',
    crypt('admin123', gen_salt('bf', 10)),
    CURRENT_TIMESTAMP,
    0
)
ON CONFLICT (email) DO NOTHING;

-- ==============================================================================
-- 4. Seeders: Conductores de prueba
-- Contraseña: conductor123
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
    failed_login_attempts
)
VALUES (
    gen_random_uuid(),
    'conductor1@uce.edu.ec',
    'Juan',
    'Pérez',
    'DRIVER',
    'ACTIVE',
    crypt('conductor123', gen_salt('bf', 10)),
    CURRENT_TIMESTAMP,
    0
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    role,
    status,
    password_hash,
    created_at,
    failed_login_attempts
)
VALUES (
    gen_random_uuid(),
    'conductor2@uce.edu.ec',
    'Luis',
    'Gómez',
    'DRIVER',
    'ACTIVE',
    crypt('conductor123', gen_salt('bf', 10)),
    CURRENT_TIMESTAMP,
    0
)
ON CONFLICT (email) DO NOTHING;