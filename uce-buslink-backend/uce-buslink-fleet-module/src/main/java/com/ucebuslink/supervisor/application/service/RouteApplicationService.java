package com.ucebuslink.supervisor.application.service;

import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.application.dto.route.CreateRouteCommand;
import com.ucebuslink.supervisor.application.dto.route.RouteResponse;
import com.ucebuslink.supervisor.application.usecase.ManageRouteUseCase;
import com.ucebuslink.supervisor.domain.model.Route;
import com.ucebuslink.supervisor.domain.model.RouteStop;
import com.ucebuslink.supervisor.domain.model.Stop;
import com.ucebuslink.supervisor.domain.repository.RouteRepository;
import com.ucebuslink.supervisor.domain.repository.StopRepository;
import com.ucebuslink.shared.event.AdminEntityChangedEvent;
import org.springframework.context.ApplicationEventPublisher;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
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
    private final ApplicationEventPublisher eventPublisher;

    public RouteApplicationService(RouteRepository routeRepository, StopRepository stopRepository, ApplicationEventPublisher eventPublisher) {
        this.routeRepository = routeRepository;
        this.stopRepository = stopRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    @CacheEvict(value = "routes", allEntries = true)
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
        eventPublisher.publishEvent(new AdminEntityChangedEvent("ROUTE", "CREATED", savedRoute.getId()));
        return mapToResponse(savedRoute);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "routes", key = "'allActive'")
    public List<RouteResponse> getAllActiveRoutes() {
        log.info("Fetching all active routes (Cache miss if log appears)");
        return routeRepository.findAllActive().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "routes", key = "'paginated_' + #isActive + '_' + #page + '_' + #size")
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
    @Cacheable(value = "routes", key = "#id")
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
    @CacheEvict(value = "routes", allEntries = true)
    public void deleteRoute(UUID id) {
        log.info("Attempting to delete route with ID: {}", id);
        routeRepository.deleteById(id);
        log.info("Route {} deleted successfully", id);
        eventPublisher.publishEvent(new AdminEntityChangedEvent("ROUTE", "DELETED", id));
    }

    @Override
    @Transactional
    @Caching(
        evict = { @CacheEvict(value = "routes", key = "'allActive'"), @CacheEvict(value = "routes", key = "'paginated_*'") },
        put = { @CachePut(value = "routes", key = "#id") }
    )
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
            
            // HIBERNATE FIX: Clear and refill instead of setting a new list
            route.getRouteStops().clear();
            route.getRouteStops().addAll(updatedStops);
        }

        Route updatedRoute = routeRepository.update(route);
        log.info("Route {} updated successfully", id);
        eventPublisher.publishEvent(new AdminEntityChangedEvent("ROUTE", "UPDATED", updatedRoute.getId()));
        return mapToResponse(updatedRoute);
    }

    private RouteResponse mapToResponse(Route route) {
        
        List<RouteResponse.RouteStopDetailResponse> stopDetails = null;

        // Verify that the route has stops to avoid NullPointerExceptions
        if (route.getRouteStops() != null) {
            stopDetails = route.getRouteStops().stream()
                .map(routeStop -> {
                    // Extract the stop associated with this relationship
                    Stop stop = routeStop.getStop();
                    
                    return new RouteResponse.RouteStopDetailResponse(
                        stop.getId(),
                        stop.getName(),
                        stop.getLatitude(),
                        stop.getLongitude(),
                        routeStop.getStopOrder(),
                        routeStop.getEstimatedMinutesFromStart()
                    );
                })
                .collect(Collectors.toList());
        }

        return new RouteResponse(
                route.getId(),
                route.getName(),
                route.getDescription(),
                route.getIsActive(),
                route.getEstimatedDurationMinutes(),
                route.getPathPolyline(),
                stopDetails // <-- We pass the built list here
        );
    }

    @Override
    @Transactional
    @Caching(
        evict = { @CacheEvict(value = "routes", key = "'allActive'"), @CacheEvict(value = "routes", key = "'paginated_*'") },
        put = { @CachePut(value = "routes", key = "#id") }
    )
    public RouteResponse changeRouteStatus(UUID id, boolean isActive) {
        log.info("Attempting to change status of route {} to isActive={}", id, isActive);
        
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Route not found with ID: {}", id);
                    return new RuntimeException("Route not found with id: " + id);
                });

        route.setIsActive(isActive);
        
        // We use the update method we fixed earlier to ensure
        // the collections are synchronized correctly
        Route updatedRoute = routeRepository.update(route); 
        
        log.info("Route {} status updated successfully", id);
        eventPublisher.publishEvent(new AdminEntityChangedEvent("ROUTE", "UPDATED", updatedRoute.getId()));
        return mapToResponse(updatedRoute);
    }
}