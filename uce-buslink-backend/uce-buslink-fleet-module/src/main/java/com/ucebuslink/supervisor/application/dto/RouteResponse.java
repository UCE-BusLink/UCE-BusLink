package com.ucebuslink.supervisor.application.dto;

import java.util.List;
import java.util.UUID;

public record RouteResponse(
    UUID id,
    String name,
    String description,
    Boolean isActive,
    Integer estimatedDurationMinutes,
    String pathPolyline,
    List<RouteStopDetailResponse> stops // <-- Agregar esto
) {
    public record RouteStopDetailResponse(
        UUID stopId,
        String stopName,
        Double latitude,
        Double longitude,
        Integer stopOrder,
        Integer estimatedMinutesFromStart
    ) {}
}