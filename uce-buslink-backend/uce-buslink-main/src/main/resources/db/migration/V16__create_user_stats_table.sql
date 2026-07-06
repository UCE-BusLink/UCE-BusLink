CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL UNIQUE,

    total_trips INTEGER NOT NULL DEFAULT 0,
    completed_trips INTEGER NOT NULL DEFAULT 0,

    total_distance_km DOUBLE PRECISION NOT NULL DEFAULT 0,
    total_hours_transit DOUBLE PRECISION NOT NULL DEFAULT 0,

    active_days INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT fk_user_stats_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_user_stats_user_id
    ON user_stats(user_id);