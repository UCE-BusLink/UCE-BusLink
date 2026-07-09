package com.ucebuslink.supervisor.domain.model;

import java.util.List;
import java.util.UUID;

public class Schedule {
    private final UUID id;
    private final UUID routeId;
    private final List<ScheduleDetail> details;
    private final boolean active;

    public Schedule(UUID id, UUID routeId, List<ScheduleDetail> details, boolean active) {
        if (routeId == null) throw new IllegalArgumentException("Invalid route.");
        if (details == null || details.isEmpty()) throw new IllegalArgumentException("Must have at least one detail.");
        
        this.id = id;
        this.routeId = routeId;
        this.details = List.copyOf(details);
        this.active = active;
    }

    public UUID getId() { return id; }
    public UUID getRouteId() { return routeId; }
    public List<ScheduleDetail> getDetails() { return details; }
    public boolean isActive() { return active; }
}