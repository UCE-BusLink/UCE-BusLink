package com.ucebuslink.identity.web;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    // Solo los administradores pueden acceder aquí
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/conductores")
    public ResponseEntity<String> testAdminAccess() {
        return ResponseEntity.ok("¡Acceso concedido! Tienes rol de ADMIN.");
    }
}