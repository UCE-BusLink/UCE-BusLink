package com.ucebuslink.supervisor.domain.model;

import java.time.LocalDateTime;

public class RouteStop {
    private Stop stop;
    private Integer stopOrder;
    private Integer estimatedMinutesFromStart;
    private LocalDateTime createdAt;

    public RouteStop() {}

    public RouteStop(Stop stop, Integer stopOrder, Integer estimatedMinutesFromStart, LocalDateTime createdAt) {
        this.stop = stop;
        this.stopOrder = stopOrder;
        this.estimatedMinutesFromStart = estimatedMinutesFromStart;
        this.createdAt = createdAt;
    }

    // Getters y Setters
    public Stop getStop() { return stop; }
    public void setStop(Stop stop) { this.stop = stop; }

    public Integer getStopOrder() { return stopOrder; }
    public void setStopOrder(Integer stopOrder) { this.stopOrder = stopOrder; }

    public Integer getEstimatedMinutesFromStart() { return estimatedMinutesFromStart; }
    public void setEstimatedMinutesFromStart(Integer estimatedMinutesFromStart) { this.estimatedMinutesFromStart = estimatedMinutesFromStart; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}