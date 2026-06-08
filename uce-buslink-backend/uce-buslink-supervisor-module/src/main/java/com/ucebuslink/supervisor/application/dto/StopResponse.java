package com.ucebuslink.supervisor.application.dto;

import java.util.UUID;

public record StopResponse(
    UUID id,
    String name,
    Double latitude,
    Double longitude,
    Boolean isActive
) {}