package com.ucebuslink.supervisor.application.dto.schedule;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record UpdateScheduleCommand(
    @NotEmpty(message = "Debe enviar al menos un detalle de horario")
    @Valid
    List<ScheduleDetailCommand> details,
    
    @NotNull(message = "El estado activo es obligatorio")
    Boolean active
) {}