package com.ucebuslink.supervisor.adapters.input.http;

import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.application.dto.route.ChangeRouteStatusCommand;
import com.ucebuslink.supervisor.application.dto.route.CreateRouteCommand;
import com.ucebuslink.supervisor.application.dto.route.RoutePreviewRequest;
import com.ucebuslink.supervisor.application.dto.route.RouteResponse;
import com.ucebuslink.supervisor.application.usecase.ManageRouteUseCase;
import com.ucebuslink.supervisor.domain.model.Stop;
import com.ucebuslink.supervisor.domain.repository.StopRepository;
import com.ucebuslink.supervisor.infrastructure.external.google.GoogleMapsRoutingService;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/supervisor/fleet/routes")
public class RouteController {

    private static final Logger log = LoggerFactory.getLogger(RouteController.class);
    private final ManageRouteUseCase manageRouteUseCase;
    private final StopRepository stopRepository;
    private final GoogleMapsRoutingService googleMapsService;

    public RouteController(ManageRouteUseCase manageRouteUseCase, StopRepository stopRepository, GoogleMapsRoutingService googleMapsService) {
        this.manageRouteUseCase = manageRouteUseCase;
        this.stopRepository = stopRepository;
        this.googleMapsService = googleMapsService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RouteResponse> createRoute(@Valid @RequestBody CreateRouteCommand command) {
        log.info("[ROUTE] Registering new route: {}", command.name());
        RouteResponse response = manageRouteUseCase.createRoute(command);
        log.info("[ROUTE] Route {} created with ID: {}", command.name(), response.id());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PageResponse<RouteResponse>> getRoutes(
            @RequestParam(defaultValue = "true") boolean activa,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.debug("[ROUTE] Listing routes (Active: {}, Page: {}, Size: {})", activa, page, size);
        return ResponseEntity.ok(manageRouteUseCase.getRoutes(activa, page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RouteResponse> getRouteById(@PathVariable(name = "id") UUID id) {
        log.debug("[ROUTE] Querying route detail ID: {}", id);
        return ResponseEntity.ok(manageRouteUseCase.getRouteById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRoute(@PathVariable(name = "id") UUID id) {
        log.info("[ROUTE] Deleting route with ID: {}", id);
        manageRouteUseCase.deleteRoute(id);
        log.info("[ROUTE] Route with ID {} successfully deleted", id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RouteResponse> updateRoute(@PathVariable UUID id, @Valid @RequestBody CreateRouteCommand command) {
        log.info("[ROUTE] Updating route with ID: {}", id);
        return ResponseEntity.ok(manageRouteUseCase.updateRoute(id, command));
    }

    @PostMapping("/preview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GoogleMapsRoutingService.RoutingResult> previewRoute(
            @Valid @RequestBody RoutePreviewRequest request) {
        
        List<GoogleMapsRoutingService.LatLngPoints> pointsForGoogle = request.waypoints().stream()
            .map(wp -> {
                // If the administrator sent a stop ID, we look up its coordinates in the DB
                if (wp.stopId() != null) {
                    Stop stop = stopRepository.findById(wp.stopId())
                        .orElseThrow(() -> new RuntimeException("Stop not found: " + wp.stopId()));
                    return new GoogleMapsRoutingService.LatLngPoints(stop.getLatitude(), stop.getLongitude());
                }
                // If there is no ID, it means it's a free click on the map to force the bus to go through a street
                else if (wp.customLatitude() != null && wp.customLongitude() != null) {
                    return new GoogleMapsRoutingService.LatLngPoints(wp.customLatitude(), wp.customLongitude());
                }

                throw new IllegalArgumentException("Each waypoint must have either a stopId or custom coordinates");
            })
            .collect(Collectors.toList());

        // Call the Google Maps service that already calculates the street segments
        GoogleMapsRoutingService.RoutingResult result = googleMapsService.calculateRoute(pointsForGoogle);

        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RouteResponse> changeRouteStatus(
            @PathVariable UUID id, 
            @Valid @RequestBody ChangeRouteStatusCommand command) {
        log.info("[ROUTE] Changing status of route ID: {} to active={}", id, command.isActive());
        return ResponseEntity.ok(manageRouteUseCase.changeRouteStatus(id, command.isActive()));
    }
}