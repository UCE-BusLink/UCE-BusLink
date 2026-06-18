package com.ucebuslink.supervisor.application.usecase;

import com.ucebuslink.supervisor.application.dto.CreateScheduleCommand;
import com.ucebuslink.supervisor.application.dto.UpdateScheduleCommand;
import com.ucebuslink.supervisor.application.dto.ScheduleResponse;

import java.util.List;
import java.util.UUID;

public interface ManageScheduleUseCase {
    ScheduleResponse create(CreateScheduleCommand command);
    List<ScheduleResponse> findByRouteId(UUID routeId);
    ScheduleResponse update(UUID id, UpdateScheduleCommand command);
    void delete(UUID id);

    List<ScheduleResponse> createBatch(List<CreateScheduleCommand> commands);
}