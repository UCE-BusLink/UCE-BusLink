package com.ucebuslink.supervisor.application.usecase;

import com.ucebuslink.supervisor.application.dto.CreateRouteCommand;
import com.ucebuslink.supervisor.application.dto.RouteResponse;
import java.util.List;
import java.util.UUID;

public interface ManageRouteUseCase {
    RouteResponse createRoute(CreateRouteCommand command);
    List<RouteResponse> getAllActiveRoutes();
    RouteResponse getRouteById(UUID id);
    void deleteRoute(UUID id);
}