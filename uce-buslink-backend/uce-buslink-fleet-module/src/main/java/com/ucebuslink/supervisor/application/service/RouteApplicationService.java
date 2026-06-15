package com.ucebuslink.supervisor.application.service;

import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.application.dto.CreateRouteCommand;
import com.ucebuslink.supervisor.application.dto.RouteResponse;
import com.ucebuslink.supervisor.application.usecase.ManageRouteUseCase;
import com.ucebuslink.supervisor.domain.model.Route;
import com.ucebuslink.supervisor.domain.model.RouteStop;
import com.ucebuslink.supervisor.domain.model.Stop;
import com.ucebuslink.supervisor.domain.repository.RouteRepository;
import com.ucebuslink.supervisor.domain.repository.StopRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RouteApplicationService implements ManageRouteUseCase {

    private static final Logger log = LoggerFactory.getLogger(RouteApplicationService.class);

    private final RouteRepository routeRepository;
    private final StopRepository stopRepository;

    public RouteApplicationService(RouteRepository routeRepository, StopRepository stopRepository) {
        this.routeRepository = routeRepository;
        this.stopRepository = stopRepository;
    }

    @Override
    @Transactional
    @CacheEvict(value = "activeRoutes", allEntries = true)
    public RouteResponse createRoute(CreateRouteCommand command) {
        log.info("Attempting to create a new route: {}", command.name());
        Route route = new Route();
        route.setName(command.name());
        route.setDescription(command.description());
        route.setEstimatedDurationMinutes(command.estimatedDurationMinutes());
        route.setPathPolyline(command.pathPolyline());
        route.setIsActive(true);

        if (command.stops() != null) {
            log.debug("Processing {} stops for new route", command.stops().size());
            List<RouteStop> routeStops = command.stops().stream().map(stopCommand -> {
                Stop stop = stopRepository.findById(stopCommand.stopId())
                        .orElseThrow(() -> {
                            log.error("Stop not found with ID: {}", stopCommand.stopId());
                            return new RuntimeException("Stop not found: " + stopCommand.stopId());
                        });
                
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
        log.info("Route created successfully with ID: {}", savedRoute.getId());
        return mapToResponse(savedRoute);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "activeRoutes", key = "'all'")
    public List<RouteResponse> getAllActiveRoutes() {
        log.info("Fetching all active routes (Cache miss if log appears)");
        return routeRepository.findAllActive().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RouteResponse> getRoutes(boolean isActive, int page, int size) {
        log.info("Fetching paginated routes. Active: {}, Page: {}, Size: {}", isActive, page, size);
        PageResponse<Route> domainPage = routeRepository.findAll(isActive, page, size);
        
        List<RouteResponse> dtos = domainPage.content().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
                
        return new PageResponse<>(dtos, domainPage.pageNumber(), domainPage.pageSize(), domainPage.totalElements(), domainPage.totalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public RouteResponse getRouteById(UUID id) {
        log.info("Fetching route by ID: {}", id);
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Route not found with ID: {}", id);
                    return new RuntimeException("Route not found with id: " + id);
                });
        return mapToResponse(route);
    }

    @Override
    @Transactional
    @CacheEvict(value = "activeRoutes", allEntries = true)
    public void deleteRoute(UUID id) {
        log.info("Attempting to delete route with ID: {}", id);
        routeRepository.deleteById(id);
        log.info("Route {} deleted successfully", id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "activeRoutes", allEntries = true)
    public RouteResponse updateRoute(UUID id, CreateRouteCommand command) {
        log.info("Attempting to update route with ID: {}", id);
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Route not found with ID: {}", id);
                    return new RuntimeException("Route not found with id: " + id);
                });

        route.setName(command.name());
        route.setDescription(command.description());
        route.setEstimatedDurationMinutes(command.estimatedDurationMinutes());
        route.setPathPolyline(command.pathPolyline());

        if (command.stops() != null) {
            log.debug("Updating {} stops for route {}", command.stops().size(), id);
            List<RouteStop> updatedStops = command.stops().stream().map(stopCommand -> {
                Stop stop = stopRepository.findById(stopCommand.stopId())
                        .orElseThrow(() -> {
                            log.error("Stop not found with ID: {}", stopCommand.stopId());
                            return new RuntimeException("Stop not found: " + stopCommand.stopId());
                        });
                return new RouteStop(stop, stopCommand.stopOrder(), stopCommand.estimatedMinutesFromStart(), LocalDateTime.now());
            }).collect(Collectors.toList());
            
            route.setRouteStops(updatedStops);
        }

        Route updatedRoute = routeRepository.save(route);
        log.info("Route {} updated successfully", id);
        return mapToResponse(updatedRoute);
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