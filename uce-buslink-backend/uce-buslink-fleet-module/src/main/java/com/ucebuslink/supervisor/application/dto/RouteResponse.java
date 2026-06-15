package com.ucebuslink.supervisor.application.dto;

import java.util.UUID;

public record RouteResponse(
    UUID id,
    String name,
    String description,
    Boolean isActive,
    Integer estimatedDurationMinutes,
    String pathPolyline
) {}