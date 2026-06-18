package com.ucebuslink.supervisor.application.dto;

import java.util.List;
import java.util.UUID;

public record RoutePreviewRequest(
    List<WaypointCommand> waypoints
) {
    public record WaypointCommand(
        UUID stopId,
        Double customLatitude,
        Double customLongitude
    ) {}
}