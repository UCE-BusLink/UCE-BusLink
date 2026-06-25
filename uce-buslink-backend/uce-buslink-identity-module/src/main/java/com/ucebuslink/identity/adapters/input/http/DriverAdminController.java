package com.ucebuslink.identity.adapters.input.http;

import com.ucebuslink.identity.application.AdminService;
import com.ucebuslink.identity.application.dto.UserResponse;
import com.ucebuslink.shared.dto.CreateDriverRequest;
import com.ucebuslink.shared.dto.DriverCreatedResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
public class DriverAdminController {

    private static final Logger log = LoggerFactory.getLogger(DriverAdminController.class);
    private final AdminService adminService;

    public DriverAdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/drivers")
    public ResponseEntity<?> createDriver(@Valid @RequestBody CreateDriverRequest request) {
        // Record syntax: request.email() instead of request.getEmail()
        log.info("[ADMIN] Request to create new driver with email: {}", request.email());
        
        try {
            DriverCreatedResponse response = adminService.createDriver(request);
            log.info("[ADMIN] Driver created successfully with ID: {}", response.id());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("[ADMIN] Conflict creating driver {}: {}", request.email(), e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            log.error("[ADMIN] Unexpected error creating driver {}: ", request.email(), e);
            throw e;
        }
    }

    @GetMapping("/drivers")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    public ResponseEntity<Page<UserResponse>> getAllDrivers(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
            
        log.info("[REST-IDENTITY] Solicitud GET recibida para listar todos los conductores. Page: {}, Size: {}", page, size);
        
        Page<UserResponse> response = adminService.getAllDrivers(page, size);
        
        return ResponseEntity.ok(response);
    }
}