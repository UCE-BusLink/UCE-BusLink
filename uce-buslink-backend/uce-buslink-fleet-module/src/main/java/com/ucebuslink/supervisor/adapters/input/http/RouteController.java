package com.ucebuslink.supervisor.adapters.input.http;

import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.application.dto.CreateRouteCommand;
import com.ucebuslink.supervisor.application.dto.RoutePreviewRequest;
import com.ucebuslink.supervisor.application.dto.RouteResponse;
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
@PreAuthorize("hasRole('ADMIN')")
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
    public ResponseEntity<RouteResponse> createRoute(@Valid @RequestBody CreateRouteCommand command) {
        log.info("[ROUTE] Registrando nueva ruta: {}", command.name());
        RouteResponse response = manageRouteUseCase.createRoute(command);
        log.info("[ROUTE] Ruta {} creada con ID: {}", command.name(), response.id());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<PageResponse<RouteResponse>> getRoutes(
            @RequestParam(defaultValue = "true") boolean activa,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.debug("[ROUTE] Listando rutas (Activa: {}, Página: {}, Tamaño: {})", activa, page, size);
        return ResponseEntity.ok(manageRouteUseCase.getRoutes(activa, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RouteResponse> getRouteById(@PathVariable(name = "id") UUID id) {
        log.debug("[ROUTE] Consultando detalle de la ruta ID: {}", id);
        return ResponseEntity.ok(manageRouteUseCase.getRouteById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoute(@PathVariable(name = "id") UUID id) {
        log.info("[ROUTE] Eliminando ruta con ID: {}", id);
        manageRouteUseCase.deleteRoute(id);
        log.info("[ROUTE] Ruta con ID {} eliminada con éxito", id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<RouteResponse> updateRoute(@PathVariable UUID id, @Valid @RequestBody CreateRouteCommand command) {
        log.info("[ROUTE] Actualizando ruta con ID: {}", id);
        return ResponseEntity.ok(manageRouteUseCase.updateRoute(id, command));
    }

    @PostMapping("/preview")
    public ResponseEntity<GoogleMapsRoutingService.RoutingResult> previewRoute(
            @Valid @RequestBody RoutePreviewRequest request) {
        
        List<GoogleMapsRoutingService.LatLngPoints> pointsForGoogle = request.waypoints().stream()
            .map(wp -> {
                // Si el administrador envió un ID de parada, buscamos sus coordenadas en la BD
                if (wp.stopId() != null) {
                    Stop stop = stopRepository.findById(wp.stopId())
                        .orElseThrow(() -> new RuntimeException("Parada no encontrada: " + wp.stopId()));
                    return new GoogleMapsRoutingService.LatLngPoints(stop.getLatitude(), stop.getLongitude());
                } 
                // Si no hay ID, significa que es un clic libre en el mapa para forzar al bus a ir por una calle
                else if (wp.customLatitude() != null && wp.customLongitude() != null) {
                    return new GoogleMapsRoutingService.LatLngPoints(wp.customLatitude(), wp.customLongitude());
                }
                
                throw new IllegalArgumentException("Cada waypoint debe tener un stopId o coordenadas personalizadas");
            })
            .collect(Collectors.toList());

        // Llamamos a tu servicio de Google Maps que ya calcula los tramos de las calles
        GoogleMapsRoutingService.RoutingResult result = googleMapsService.calculateRoute(pointsForGoogle);

        return ResponseEntity.ok(result);
    }
}