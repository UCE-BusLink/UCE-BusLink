package com.ucebuslink.supervisor.application.dto;

import java.util.List;
import java.util.UUID;

public record ScheduleResponse(
    UUID id,
    UUID routeId,
    List<ScheduleDetailResponse> details,
    boolean active
) {}