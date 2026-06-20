package com.ucebuslink.supervisor.application.usecase;

import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.application.dto.route.CreateRouteCommand;
import com.ucebuslink.supervisor.application.dto.route.RouteResponse;

import java.util.List;
import java.util.UUID;

public interface ManageRouteUseCase {
    RouteResponse createRoute(CreateRouteCommand command);
    List<RouteResponse> getAllActiveRoutes();
    RouteResponse getRouteById(UUID id);
    void deleteRoute(UUID id);

    RouteResponse updateRoute(UUID id, CreateRouteCommand command); // Usamos el DTO de creación por simplicidad

    PageResponse<RouteResponse> getRoutes(boolean isActive, int page, int size);

    RouteResponse changeRouteStatus(UUID id, boolean isActive);
}