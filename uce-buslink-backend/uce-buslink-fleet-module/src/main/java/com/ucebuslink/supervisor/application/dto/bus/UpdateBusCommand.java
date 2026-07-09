package com.ucebuslink.supervisor.application.dto.bus;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateBusCommand(
    @NotBlank(message = "The plate number is required") String plateNumber,
    @NotBlank(message = "The internal code is required") String internalCode,
    @NotNull(message = "The capacity is required") @Min(1) Integer seatCapacity,
    String manufacturer,
    String model,
    Integer manufacturingYear
) {}