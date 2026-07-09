package com.ucebuslink.supervisor.application.usecase;

import com.ucebuslink.shared.dto.BatchResult;
import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.application.dto.stop.ChangeStopStatusCommand;
import com.ucebuslink.supervisor.application.dto.stop.CreateStopCommand;
import com.ucebuslink.supervisor.application.dto.stop.StopResponse;
import com.ucebuslink.supervisor.application.dto.stop.UpdateStopCommand;

import java.util.List;
import java.util.UUID;

public interface ManageStopUseCase {
    StopResponse createStop(CreateStopCommand command);
    BatchResult<StopResponse> createStopsBatch(List<CreateStopCommand> commands);
    List<StopResponse> getAllActiveStops();
    StopResponse updateStop(UUID id, UpdateStopCommand command);
    void deleteStop(UUID id);

    PageResponse<StopResponse> getAllStops(boolean isActive, int page, int size);

    StopResponse changeStatus(UUID id, ChangeStopStatusCommand command);
}