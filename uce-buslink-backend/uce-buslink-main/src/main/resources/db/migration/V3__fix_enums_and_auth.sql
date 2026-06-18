-- ==============================================================================
-- V3: FIX ENUM COMPATIBILITY WITH HIBERNATE
-- Replace PostgreSQL ENUMs with VARCHAR for safer JPA integration
-- ==============================================================================

-- ROLE
ALTER TABLE users
ALTER COLUMN role TYPE VARCHAR(50)
USING role::text;

-- STATUS
ALTER TABLE users
ALTER COLUMN status TYPE VARCHAR(50)
USING status::text;