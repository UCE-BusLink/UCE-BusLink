package com.ucebuslink.supervisor.application.usecase;

import com.ucebuslink.supervisor.application.dto.CreateBusCommand;
import com.ucebuslink.supervisor.application.dto.RouteResponse;
import com.ucebuslink.supervisor.application.dto.UpdateBusCommand;
import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.application.dto.BusResponse;
import com.ucebuslink.supervisor.application.dto.ChangeBusStatusCommand;

import java.util.List;
import java.util.UUID;

public interface ManageBusUseCase {
    BusResponse createBus(CreateBusCommand command);
    // List<BusResponse> getAllActiveBuses();
    BusResponse getBusById(UUID id);
    void deleteBus(UUID id);

    BusResponse updateBus(UUID id, UpdateBusCommand command);
    BusResponse changeBusStatus(UUID id, ChangeBusStatusCommand command);

    // Cambia los métodos para retornar PageResponse
    PageResponse<BusResponse> getAllActiveBuses(int page, int size);
}