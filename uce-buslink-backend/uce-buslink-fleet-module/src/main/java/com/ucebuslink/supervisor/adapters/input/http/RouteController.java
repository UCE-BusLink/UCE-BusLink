package com.ucebuslink.supervisor.adapters.input.http;

import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.application.dto.CreateRouteCommand;
import com.ucebuslink.supervisor.application.dto.RouteResponse;
import com.ucebuslink.supervisor.application.usecase.ManageRouteUseCase;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/supervisor/fleet/routes")
@PreAuthorize("hasRole('ADMIN')")
public class RouteController {

    private static final Logger log = LoggerFactory.getLogger(RouteController.class);
    private final ManageRouteUseCase manageRouteUseCase;

    public RouteController(ManageRouteUseCase manageRouteUseCase) {
        this.manageRouteUseCase = manageRouteUseCase;
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
}