package com.ucebuslink.supervisor.application.usecase;

import com.ucebuslink.supervisor.application.dto.CreateStopCommand;
import com.ucebuslink.supervisor.application.dto.StopResponse;
import java.util.List;

public interface ManageStopUseCase {
    StopResponse createStop(CreateStopCommand command);
    List<StopResponse> getAllActiveStops();
}