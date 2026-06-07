package com.ucebuslink.supervisor.adapters.input.http;

import com.ucebuslink.supervisor.application.dto.CreateRouteCommand;
import com.ucebuslink.supervisor.application.dto.RouteResponse;
import com.ucebuslink.supervisor.application.usecase.ManageRouteUseCase;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/supervisor/fleet/routes")
@PreAuthorize("hasRole('ADMIN')") // Protegido: Solo administradores
public class RouteController {

    private final ManageRouteUseCase manageRouteUseCase;

    public RouteController(ManageRouteUseCase manageRouteUseCase) {
        this.manageRouteUseCase = manageRouteUseCase;
    }

    @PostMapping
    public ResponseEntity<RouteResponse> createRoute(@RequestBody CreateRouteCommand command) {
        RouteResponse response = manageRouteUseCase.createRoute(command);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<RouteResponse>> getAllRoutes() {
        return ResponseEntity.ok(manageRouteUseCase.getAllActiveRoutes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RouteResponse> getRouteById(@PathVariable UUID id) {
        return ResponseEntity.ok(manageRouteUseCase.getRouteById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoute(@PathVariable UUID id) {
        manageRouteUseCase.deleteRoute(id);
        return ResponseEntity.noContent().build();
    }
}