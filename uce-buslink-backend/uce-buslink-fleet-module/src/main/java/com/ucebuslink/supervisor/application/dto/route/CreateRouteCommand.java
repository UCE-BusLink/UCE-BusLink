package com.ucebuslink.supervisor.application.dto.route;

import java.util.List;
import java.util.UUID;

public record CreateRouteCommand(
    String name,
    String description,
    Integer estimatedDurationMinutes,
    String pathPolyline, // Nuestro campo estrella para el mapa
    List<RouteStopCommand> stops
) {
    public record RouteStopCommand(
        UUID stopId,
        Integer stopOrder,
        Integer estimatedMinutesFromStart
    ) {}
}