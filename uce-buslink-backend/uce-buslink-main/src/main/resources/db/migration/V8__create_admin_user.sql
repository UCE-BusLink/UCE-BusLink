-- Insertar el administrador por defecto usando el ID de Clerk
INSERT INTO users (
    id, 
    email, 
    first_name, 
    last_name, 
    role, 
    status, 
    clerk_user_id, 
    created_at, 
    updated_at,
    failed_login_attempts
) VALUES (
    gen_random_uuid(), -- Genera un UUID nativo en PostgreSQL
    'admin@ucebuslink.com', 
    'Admin', 
    'BusLink', 
    'ADMIN', -- Asegúrate de que coincida con el Enum en BD
    'ACTIVE', -- Asegúrate de que coincida con el Enum en BD
    'user_3EuahOcSeg4mo2zJBduZxsbnpJW', -- Pega el ID que copiaste de Clerk (ej: user_2pA7...)
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP,
    0
);