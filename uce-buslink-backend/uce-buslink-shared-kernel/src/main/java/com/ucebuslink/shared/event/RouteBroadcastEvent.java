package com.ucebuslink.shared.event;

import java.util.List;
import java.util.UUID;

// Carries the full, already-computed route representation so every connected
// client (student/driver/admin) can apply the change directly to its local
// cache over WebSocket, without an extra REST round-trip.
public record RouteBroadcastEvent(
    ChangeType changeType,
    UUID routeId,
    String name,
    String description,
    Boolean isActive,
    Integer estimatedDurationMinutes,
    String pathPolyline,
    List<StopSummary> stops
) {
    public enum ChangeType { CREATED, UPDATED, STATUS_CHANGED, DELETED }

    public record StopSummary(
        UUID stopId,
        String stopName,
        Double latitude,
        Double longitude,
        Integer stopOrder,
        Integer estimatedMinutesFromStart
    ) {}
}
