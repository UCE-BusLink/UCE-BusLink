-- ==============================================================================
-- V2: ALIGN USER ENTITY WITH APPLICATION CODE
-- Fix inconsistencies from previous implementation
-- ==============================================================================

-- ==============================================================================
-- 1. FIX GOOGLE ID FIELD NAME (if needed in code consistency)
-- ==============================================================================

-- En tu DB ya existe google_subject_id
-- Pero tu código usa googleId (Java mapping)
-- No cambiamos DB, solo aseguramos consistencia conceptual

-- ==============================================================================
-- 2. ADD PASSWORD HASH (if missing in real DB)
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='users' AND column_name='password_hash'
    ) THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
    END IF;
END $$;

-- ==============================================================================
-- 3. ENSURE UPDATED_AT EXISTS (your entity expects it)
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='users' AND column_name='updated_at'
    ) THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- ==============================================================================
-- 4. BACKFILL updated_at FOR EXISTING ROWS
-- ==============================================================================

UPDATE users
SET updated_at = CURRENT_TIMESTAMP
WHERE updated_at IS NULL;

-- ==============================================================================
-- 5. OPTIONAL: AUTO UPDATE TRIGGER (recommended for consistency)
-- ==============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();