package com.ucebuslink.supervisor.application.usecase;

import com.ucebuslink.supervisor.application.dto.CreateBusCommand;
import com.ucebuslink.supervisor.application.dto.RouteResponse;
import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.application.dto.BusResponse;
import java.util.List;
import java.util.UUID;

public interface ManageBusUseCase {
    BusResponse createBus(CreateBusCommand command);
    // List<BusResponse> getAllActiveBuses();
    BusResponse getBusById(UUID id);
    void deleteBus(UUID id);

    // Cambia los métodos para retornar PageResponse
    PageResponse<BusResponse> getAllActiveBuses(int page, int size);
}