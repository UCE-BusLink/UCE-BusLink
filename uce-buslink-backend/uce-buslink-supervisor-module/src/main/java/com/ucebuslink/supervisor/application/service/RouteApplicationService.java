package com.ucebuslink.supervisor.application.service;

import com.ucebuslink.supervisor.application.dto.CreateRouteCommand;
import com.ucebuslink.supervisor.application.dto.RouteResponse;
import com.ucebuslink.supervisor.application.usecase.ManageRouteUseCase;
import com.ucebuslink.supervisor.domain.model.Route;
import com.ucebuslink.supervisor.domain.model.RouteStop;
import com.ucebuslink.supervisor.domain.model.Stop;
import com.ucebuslink.supervisor.domain.repository.RouteRepository;
import com.ucebuslink.supervisor.domain.repository.StopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RouteApplicationService implements ManageRouteUseCase {

    private final RouteRepository routeRepository;
    private final StopRepository stopRepository;

    public RouteApplicationService(RouteRepository routeRepository, StopRepository stopRepository) {
        this.routeRepository = routeRepository;
        this.stopRepository = stopRepository;
    }

    @Override
    @Transactional
    public RouteResponse createRoute(CreateRouteCommand command) {
        Route route = new Route();
        route.setName(command.name());
        route.setDescription(command.description());
        route.setEstimatedDurationMinutes(command.estimatedDurationMinutes());
        route.setPathPolyline(command.pathPolyline());
        route.setIsActive(true);

        // Mapear y validar las paradas
        if (command.stops() != null) {
            List<RouteStop> routeStops = command.stops().stream().map(stopCommand -> {
                Stop stop = stopRepository.findById(stopCommand.stopId())
                        .orElseThrow(() -> new RuntimeException("Stop not found: " + stopCommand.stopId()));
                
                return new RouteStop(
                        stop,
                        stopCommand.stopOrder(),
                        stopCommand.estimatedMinutesFromStart(),
                        LocalDateTime.now()
                );
            }).collect(Collectors.toList());
            
            route.setRouteStops(routeStops);
        }

        Route savedRoute = routeRepository.save(route);
        return mapToResponse(savedRoute);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RouteResponse> getAllActiveRoutes() {
        return routeRepository.findAllActive().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RouteResponse getRouteById(UUID id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Route not found with id: " + id));
        return mapToResponse(route);
    }

    @Override
    @Transactional
    public void deleteRoute(UUID id) {
        routeRepository.deleteById(id);
    }

    private RouteResponse mapToResponse(Route route) {
        return new RouteResponse(
                route.getId(),
                route.getName(),
                route.getDescription(),
                route.getIsActive(),
                route.getEstimatedDurationMinutes(),
                route.getPathPolyline()
        );
    }
}