CREATE TABLE schedules (
    id UUID PRIMARY KEY,
    route_id UUID NOT NULL,
    schedule_type VARCHAR(50) NOT NULL,
    frequency_start_time TIME,
    frequency_end_time TIME,
    frequency_interval_minutes INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_schedules_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

CREATE TABLE schedule_days (
    schedule_id UUID NOT NULL,
    day_of_week VARCHAR(50) NOT NULL,
    CONSTRAINT fk_schedule_days_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    PRIMARY KEY (schedule_id, day_of_week)
);

CREATE TABLE schedule_fixed_times (
    schedule_id UUID NOT NULL,
    departure_time TIME NOT NULL,
    CONSTRAINT fk_schedule_fixed_times_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    PRIMARY KEY (schedule_id, departure_time)
);