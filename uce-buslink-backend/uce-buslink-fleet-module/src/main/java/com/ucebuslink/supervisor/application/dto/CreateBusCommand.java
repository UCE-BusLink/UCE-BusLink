package com.ucebuslink.supervisor.application.dto;

import jakarta.validation.constraints.*;

public record CreateBusCommand(
    @NotBlank(message = "La placa es obligatoria")
    String plateNumber,

    @NotBlank(message = "El código interno es obligatorio")
    String internalCode,

    @NotNull(message = "La capacidad es obligatoria")
    @Min(value = 1, message = "La capacidad de asientos debe ser al menos 1")
    Integer seatCapacity,
    
    String manufacturer,
    String model
) {}