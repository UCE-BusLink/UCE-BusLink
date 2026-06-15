package com.ucebuslink.supervisor.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Route {
    private UUID id;
    private String name;
    private String description;
    private Boolean isActive;
    private Integer estimatedDurationMinutes;
    private String pathPolyline; // Campo flexible listo para el dibujado de mapas reales
    private List<RouteStop> routeStops = new ArrayList<>();
    private UUID createdBy;
    private UUID updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    public Route() {}

    public Route(UUID id, String name, String description, Boolean isActive, 
                 Integer estimatedDurationMinutes, String pathPolyline, List<RouteStop> routeStops,
                 UUID createdBy, UUID updatedBy, LocalDateTime createdAt, 
                 LocalDateTime updatedAt, LocalDateTime deletedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive;
        this.estimatedDurationMinutes = estimatedDurationMinutes;
        this.pathPolyline = pathPolyline;
        this.routeStops = routeStops != null ? routeStops : new ArrayList<>();
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    // Getters y Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getEstimatedDurationMinutes() { return estimatedDurationMinutes; }
    public void setEstimatedDurationMinutes(Integer estimatedDurationMinutes) { this.estimatedDurationMinutes = estimatedDurationMinutes; }

    public String getPathPolyline() { return pathPolyline; }
    public void setPathPolyline(String pathPolyline) { this.pathPolyline = pathPolyline; }

    public List<RouteStop> getRouteStops() { return routeStops; }
    public void setRouteStops(List<RouteStop> routeStops) { this.routeStops = routeStops; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
}