package com.ucebuslink.supervisor.application.usecase;

import com.ucebuslink.shared.dto.BatchResult;
import com.ucebuslink.supervisor.application.dto.schedule.CreateScheduleCommand;
import com.ucebuslink.supervisor.application.dto.schedule.ScheduleResponse;
import com.ucebuslink.supervisor.application.dto.schedule.UpdateScheduleCommand;

import java.util.List;
import java.util.UUID;

public interface ManageScheduleUseCase {
    ScheduleResponse create(CreateScheduleCommand command);
    List<ScheduleResponse> findByRouteId(UUID routeId);
    ScheduleResponse update(UUID id, UpdateScheduleCommand command);
    void delete(UUID id);

    BatchResult<ScheduleResponse> createBatch(List<CreateScheduleCommand> commands);
}