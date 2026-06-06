package com.ucebuslink.identity.adapters.input.http;

import com.ucebuslink.identity.application.AdminService;
import com.ucebuslink.shared.dto.CreateDriverRequest;
import com.ucebuslink.shared.dto.DriverCreatedResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/drivers")
    public ResponseEntity<?> createDriver(@Valid @RequestBody CreateDriverRequest request) {
        try {
            DriverCreatedResponse response = adminService.createDriver(request);
            // Retornamos 201 Created
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            // Manejo de error si el correo ya existe
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }
}