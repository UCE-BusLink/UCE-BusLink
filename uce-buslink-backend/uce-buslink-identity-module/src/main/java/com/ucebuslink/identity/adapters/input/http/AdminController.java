package com.ucebuslink.identity.adapters.input.http;

import com.ucebuslink.identity.application.AdminService;
import com.ucebuslink.shared.dto.CreateDriverRequest;
import com.ucebuslink.shared.dto.DriverCreatedResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
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
}