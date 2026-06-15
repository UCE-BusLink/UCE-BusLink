package com.ucebuslink.supervisor.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "route_stops")
public class RouteStopJpaEntity {

    @EmbeddedId
    private RouteStopKey id = new RouteStopKey();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("routeId")
    @JoinColumn(name = "route_id")
    private RouteJpaEntity route;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("stopId")
    @JoinColumn(name = "stop_id")
    private StopJpaEntity stop;

    @Column(name = "stop_order", nullable = false)
    private Integer stopOrder;

    @Column(name = "estimated_minutes_from_start", nullable = false)
    private Integer estimatedMinutesFromStart = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public RouteStopJpaEntity() {}

    // Getters y Setters
    public RouteStopKey getId() { return id; }
    public void setId(RouteStopKey id) { this.id = id; }
    public RouteJpaEntity getRoute() { return route; }
    public void setRoute(RouteJpaEntity route) { this.route = route; }
    public StopJpaEntity getStop() { return stop; }
    public void setStop(StopJpaEntity stop) { this.stop = stop; }
    public Integer getStopOrder() { return stopOrder; }
    public void setStopOrder(Integer stopOrder) { this.stopOrder = stopOrder; }
    public Integer getEstimatedMinutesFromStart() { return estimatedMinutesFromStart; }
    public void setEstimatedMinutesFromStart(Integer estimatedMinutesFromStart) { this.estimatedMinutesFromStart = estimatedMinutesFromStart; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}