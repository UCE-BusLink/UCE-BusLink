package com.ucebuslink.supervisor.application.dto.bus;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateBusCommand(
    @NotBlank(message = "La placa es obligatoria") String plateNumber,
    @NotBlank(message = "El código interno es obligatorio") String internalCode,
    @NotNull(message = "La capacidad es obligatoria") @Min(1) Integer seatCapacity,
    String manufacturer,
    String model,
    Integer manufacturingYear
) {}