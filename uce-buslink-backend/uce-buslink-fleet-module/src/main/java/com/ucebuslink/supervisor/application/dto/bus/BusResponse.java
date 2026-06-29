package com.ucebuslink.supervisor.application.dto.bus;

import com.ucebuslink.supervisor.domain.model.BusStatus;
import java.util.UUID;

public record BusResponse(
    UUID id,
    String plateNumber,
    String internalCode,
    Integer seatCapacity,
    String manufacturer,
    String model,
    BusStatus operationalStatus
) {}