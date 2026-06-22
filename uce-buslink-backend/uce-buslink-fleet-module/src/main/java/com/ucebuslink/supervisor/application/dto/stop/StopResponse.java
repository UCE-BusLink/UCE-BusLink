package com.ucebuslink.supervisor.application.dto.stop;

import java.util.UUID;

public record StopResponse(
    UUID id,
    String name,
    Double latitude,
    Double longitude,
    Boolean isActive
) {}