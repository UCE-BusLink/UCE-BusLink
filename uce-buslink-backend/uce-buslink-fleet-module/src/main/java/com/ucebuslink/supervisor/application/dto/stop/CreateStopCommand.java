package com.ucebuslink.supervisor.application.dto.stop;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateStopCommand(
    @NotBlank(message = "El nombre de la parada es obligatorio")
    String name,
    
    @NotNull(message = "La latitud es obligatoria")
    @Min(value = -90, message = "La latitud debe ser mayor o igual a -90")
    @Max(value = 90, message = "La latitud debe ser menor o igual a 90")
    Double latitude,
    
    @NotNull(message = "La longitud es obligatoria")
    @Min(value = -180, message = "La longitud debe ser mayor o igual a -180")
    @Max(value = 180, message = "La longitud debe ser menor o igual a 180")
    Double longitude
) {}