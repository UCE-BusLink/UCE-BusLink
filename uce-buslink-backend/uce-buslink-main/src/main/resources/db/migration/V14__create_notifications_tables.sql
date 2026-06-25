-- 1. Tabla para Tokens de Dispositivos (FCM)
CREATE TABLE device_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    fcm_token VARCHAR(500) NOT NULL,
    platform VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    last_active_at TIMESTAMP NOT NULL
);

-- Índices para búsquedas rápidas al enviar notificaciones
CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE UNIQUE INDEX idx_device_tokens_fcm_token ON device_tokens(fcm_token);

-- 1. Eliminar la clave primaria antigua que estaba en user_id
ALTER TABLE notification_preferences DROP CONSTRAINT notification_preferences_pkey;

-- 2. Agregar la nueva columna 'id' y convertirla en la nueva Primary Key
-- (Usamos gen_random_uuid() que es nativo en Postgres para generar UUIDs automáticamente)
ALTER TABLE notification_preferences ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- 3. Asegurar que user_id siga siendo único (Relación 1:1 con el Usuario)
ALTER TABLE notification_preferences ADD CONSTRAINT uk_notif_prefs_user_id UNIQUE (user_id);

-- 4. Agregar las nuevas preferencias específicas del sistema de buses
ALTER TABLE notification_preferences 
    ADD COLUMN notify_bus_leaving BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN notify_bus_approaching BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN notify_reservation_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN notify_cancellation BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN notify_trust_points BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;