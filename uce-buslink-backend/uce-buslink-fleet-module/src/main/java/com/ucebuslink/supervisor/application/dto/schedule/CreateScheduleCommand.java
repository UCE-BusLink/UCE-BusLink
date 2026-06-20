package com.ucebuslink.supervisor.application.dto.schedule;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record CreateScheduleCommand(
    @NotNull(message = "El ID de la ruta es obligatorio")
    UUID routeId,

    @NotEmpty(message = "Debe enviar al menos un detalle de horario")
    @Valid
    List<ScheduleDetailCommand> details
) {}