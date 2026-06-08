package com.ucebuslink.supervisor.application.usecase;

import com.ucebuslink.supervisor.application.dto.CreateStopCommand;
import com.ucebuslink.supervisor.application.dto.StopResponse;
import com.ucebuslink.supervisor.application.dto.UpdateStopCommand;

import java.util.List;
import java.util.UUID;

public interface ManageStopUseCase {
    StopResponse createStop(CreateStopCommand command);
    List<StopResponse> getAllActiveStops();

    StopResponse updateStop(UUID id, UpdateStopCommand command);
}