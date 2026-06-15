package com.ucebuslink.supervisor.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class RouteStopKey implements Serializable {

    @Column(name = "route_id")
    private UUID routeId;

    @Column(name = "stop_id")
    private UUID stopId;

    public RouteStopKey() {}

    public RouteStopKey(UUID routeId, UUID stopId) {
        this.routeId = routeId;
        this.stopId = stopId;
    }

    // Getters, Setters, hashCode y equals
    public UUID getRouteId() { return routeId; }
    public void setRouteId(UUID routeId) { this.routeId = routeId; }
    public UUID getStopId() { return stopId; }
    public void setStopId(UUID stopId) { this.stopId = stopId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RouteStopKey that = (RouteStopKey) o;
        return Objects.equals(routeId, that.routeId) && Objects.equals(stopId, that.stopId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(routeId, stopId);
    }
}