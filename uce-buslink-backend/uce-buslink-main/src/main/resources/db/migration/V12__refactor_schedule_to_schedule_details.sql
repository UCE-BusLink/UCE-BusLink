DROP TABLE IF EXISTS schedule_fixed_times;
DROP TABLE IF EXISTS schedule_detail_days;
DROP TABLE IF EXISTS schedule_details;
DROP TABLE IF EXISTS schedule_days;
DROP TABLE IF EXISTS schedules CASCADE;

CREATE TABLE schedules (
    id UUID PRIMARY KEY,
    route_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_schedules_route
        FOREIGN KEY (route_id)
        REFERENCES routes(id)
        ON DELETE CASCADE
);

CREATE TABLE schedule_details (
    id UUID PRIMARY KEY,
    schedule_id UUID NOT NULL,
    schedule_type VARCHAR(50) NOT NULL,
    frequency_start_time TIME,
    frequency_end_time TIME,
    frequency_interval_minutes INTEGER,

    CONSTRAINT fk_schedule_details_schedule
        FOREIGN KEY (schedule_id)
        REFERENCES schedules(id)
        ON DELETE CASCADE
);

CREATE TABLE schedule_detail_days (
    schedule_detail_id UUID NOT NULL,
    day_of_week VARCHAR(50) NOT NULL,

    CONSTRAINT fk_schedule_detail_days_detail
        FOREIGN KEY (schedule_detail_id)
        REFERENCES schedule_details(id)
        ON DELETE CASCADE,

    PRIMARY KEY (schedule_detail_id, day_of_week)
);

CREATE TABLE schedule_fixed_times (
    schedule_detail_id UUID NOT NULL,
    departure_time TIME NOT NULL,

    CONSTRAINT fk_schedule_fixed_times_detail
        FOREIGN KEY (schedule_detail_id)
        REFERENCES schedule_details(id)
        ON DELETE CASCADE,

    PRIMARY KEY (schedule_detail_id, departure_time)
);