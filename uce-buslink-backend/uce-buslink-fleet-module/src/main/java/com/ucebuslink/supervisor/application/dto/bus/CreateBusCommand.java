package com.ucebuslink.supervisor.application.dto.bus;

import jakarta.validation.constraints.*;

public record CreateBusCommand(
    @NotBlank(message = "The plate number is required")
    String plateNumber,

    @NotBlank(message = "The internal code is required")
    String internalCode,

    @NotNull(message = "The capacity is required")
    @Min(value = 1, message = "The seat capacity must be at least 1")
    Integer seatCapacity,
    
    String manufacturer,
    String model
) {}