-- ==============================================================================
-- UCE-BUSLINK ENTERPRISE DATABASE SCHEMA (PostgreSQL)
-- DDD + Modular Monolith + Spring WebFlux + PostgreSQL
-- Based on SAD v3.0 Enterprise Consolidation
-- ==============================================================================

-- Habilitar extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 0. CREACIÓN DE ENUMERACIONES (POSTGRESQL NATIVE ENUMS)
-- ==============================================================================

CREATE TYPE user_role_enum AS ENUM ('STUDENT', 'DRIVER', 'ADMIN', 'SUPERVISOR');
CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE trip_state_enum AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED');
CREATE TYPE seat_state_enum AS ENUM ('AVAILABLE', 'RESERVED', 'BOARDED');
CREATE TYPE reservation_status_enum AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED_BY_STUDENT', 'CANCELLED_BY_ADMIN', 'NO_SHOW');
CREATE TYPE bus_status_enum AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'OUT_OF_SERVICE');
CREATE TYPE trust_level_enum AS ENUM ('EXCELLENT', 'GOOD', 'REGULAR', 'LOW', 'CRITICAL');
CREATE TYPE penalty_status_enum AS ENUM ('ACTIVE', 'EXPIRED');
CREATE TYPE penalty_type_enum AS ENUM ('NO_SHOW', 'LATE_CANCELLATION', 'MISCONDUCT');
CREATE TYPE incident_type_enum AS ENUM ('DELAY', 'BREAKDOWN', 'TRAFFIC', 'SECURITY');
CREATE TYPE incident_severity_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- ==============================================================================
-- 1. USER & AUTHENTICATION CONTEXT
-- ==============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role_enum NOT NULL,
    status user_status_enum NOT NULL DEFAULT 'ACTIVE',
    google_subject_id VARCHAR(255) UNIQUE,
    profile_picture_url TEXT,
    phone VARCHAR(20),
    address TEXT,
    career VARCHAR(150),
    document_number VARCHAR(50) UNIQUE,
    birth_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    details JSONB NOT NULL,
    ip_address VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- ==============================================================================
-- 2. TRUST SCORE CONTEXT
-- ==============================================================================

CREATE TABLE trust_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    level trust_level_enum NOT NULL,
    total_reservations INTEGER NOT NULL DEFAULT 0,
    completed_reservations INTEGER NOT NULL DEFAULT 0,
    no_shows INTEGER NOT NULL DEFAULT 0,
    cancellations_last_30_days INTEGER NOT NULL DEFAULT 0,
    trend_last_7_days INTEGER NOT NULL DEFAULT 0,
    next_review_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trust_scores_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE trust_penalties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trust_score_id UUID NOT NULL,
    type penalty_type_enum NOT NULL,
    reason TEXT NOT NULL,
    points_removed INTEGER NOT NULL CHECK (points_removed > 0),
    starts_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    status penalty_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trust_penalties_score FOREIGN KEY (trust_score_id) REFERENCES trust_scores(id) ON DELETE CASCADE
);

-- ==============================================================================
-- 3. ROUTING CONTEXT
-- ==============================================================================

CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    estimated_duration_minutes INTEGER NOT NULL CHECK (estimated_duration_minutes > 0),
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_routes_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_routes_updater FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE route_stops (
    route_id UUID NOT NULL,
    stop_id UUID NOT NULL,
    stop_order INTEGER NOT NULL CHECK (stop_order > 0),
    estimated_minutes_from_start INTEGER NOT NULL DEFAULT 0 CHECK (estimated_minutes_from_start >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (route_id, stop_id),
    CONSTRAINT uk_route_stop_order UNIQUE (route_id, stop_order),
    CONSTRAINT fk_route_stops_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    CONSTRAINT fk_route_stops_stop FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE RESTRICT
);

-- ==============================================================================
-- 4. FLEET CONTEXT
-- ==============================================================================

CREATE TABLE buses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number VARCHAR(50) UNIQUE NOT NULL,
    internal_code VARCHAR(50) UNIQUE NOT NULL,
    seat_capacity INTEGER NOT NULL CHECK (seat_capacity > 0),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    operational_status bus_status_enum NOT NULL DEFAULT 'OPERATIONAL',
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_buses_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_buses_updater FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ==============================================================================
-- 5. TRIP CONTEXT
-- ==============================================================================

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL,
    bus_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    state trip_state_enum NOT NULL DEFAULT 'SCHEDULED',
    departure_time TIMESTAMP NOT NULL,
    estimated_arrival_time TIMESTAMP NOT NULL,
    actual_arrival_time TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
    version BIGINT NOT NULL DEFAULT 0, -- Optimistic Locking (Spring Data / WebFlux)
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_trips_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE RESTRICT,
    CONSTRAINT fk_trips_bus FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE RESTRICT,
    CONSTRAINT fk_trips_driver FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_trips_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_trips_updater FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL,
    seat_number INTEGER NOT NULL CHECK (seat_number > 0),
    state seat_state_enum NOT NULL DEFAULT 'AVAILABLE',
    version BIGINT NOT NULL DEFAULT 0, -- Optimistic Locking
    CONSTRAINT fk_seats_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT uk_trip_seat UNIQUE (trip_id, seat_number)
);

CREATE TABLE gps_location_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    accuracy DOUBLE PRECISION,
    velocity DOUBLE PRECISION,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Append-only temporal matrix
    CONSTRAINT fk_gps_history_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE trip_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL,
    reported_by_user_id UUID NOT NULL,
    type incident_type_enum NOT NULL,
    severity incident_severity_enum NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_incidents_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_incidents_reporter FOREIGN KEY (reported_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- ==============================================================================
-- 6. RESERVATION CONTEXT
-- ==============================================================================

CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    trip_id UUID NOT NULL,
    seat_id UUID NOT NULL,
    boarding_stop_id UUID NOT NULL,
    status reservation_status_enum NOT NULL DEFAULT 'ACTIVE',
    qr_code TEXT NOT NULL,
    external_reference VARCHAR(255),
    reserved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP,
    boarded_at TIMESTAMP,
    cancel_reason TEXT,
    version BIGINT NOT NULL DEFAULT 0, -- Optimistic Locking
    CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reservations_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reservations_seat FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reservations_stop FOREIGN KEY (boarding_stop_id) REFERENCES stops(id) ON DELETE RESTRICT,
    CONSTRAINT uk_trip_user_reservation UNIQUE (trip_id, user_id) -- Business Rule 2
);

-- ==============================================================================
-- 7. OPTIONAL ENTERPRISE TABLES
-- ==============================================================================

CREATE TABLE boarding_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL,
    trip_id UUID NOT NULL,
    boarded_by_user_id UUID,
    boarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    CONSTRAINT fk_boarding_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    CONSTRAINT fk_boarding_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_boarding_supervisor FOREIGN KEY (boarded_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY,
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    share_location BOOLEAN NOT NULL DEFAULT TRUE,
    visibility VARCHAR(50) NOT NULL DEFAULT 'PUBLIC',
    CONSTRAINT fk_preferences_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==============================================================================
-- 8. RE-ESTRUCTURACIÓN DE ÍNDICES CRÍTICOS (OPTIMIZADOS PARA RENDIMIENTO)
-- ==============================================================================

-- Índices Core para Autenticación y Auditoría
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id) WHERE revoked IS FALSE;
CREATE INDEX idx_audit_logs_user_date ON audit_logs(user_id, created_at DESC);

-- Índices del Contexto de Rutas y Operaciones
CREATE INDEX idx_route_stops_composite ON route_stops(route_id, stop_order);

-- Índices del Contexto de Viajes (Optimización de Queries Reactivas de WebFlux)
CREATE INDEX idx_trips_route_departure ON trips(route_id, departure_time) WHERE deleted_at IS NULL;
CREATE INDEX idx_trips_driver ON trips(driver_id) WHERE state IN ('SCHEDULED', 'ONGOING');
CREATE INDEX idx_seats_trip_state ON seats(trip_id, state);
CREATE INDEX idx_gps_history_trip_time ON gps_location_history(trip_id, recorded_at DESC);

-- Índices del Contexto de Reservas (Control de Concurrencia de Pasajeros)
CREATE INDEX idx_reservations_user_status ON reservations(user_id, status);
CREATE INDEX idx_reservations_trip ON reservations(trip_id);