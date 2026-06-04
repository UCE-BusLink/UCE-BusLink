package com.ucebuslink.identity.web;

import com.ucebuslink.identity.application.AuthService;
import com.ucebuslink.shared.dto.AuthResponse;
import com.ucebuslink.shared.dto.GoogleLoginRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ucebuslink.shared.dto.LoginRequest;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {
        try {
            System.err.println("Recibido ID Token: " + request.idToken());
            AuthResponse response = authService.authenticateWithGoogle(request.idToken());
            return ResponseEntity.ok(response);
        } catch (IllegalAccessException e) {
            System.err.println("Error de autenticación: " + e.getMessage());
            // Devuelve 403 Forbidden para correos no institucionales (Criterio de Aceptación)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Error inesperado: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error de autenticación");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.loginWithCredentials(request.email(), request.password());
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            // Error 423 Locked para cuentas bloqueadas por intentos
            return ResponseEntity.status(HttpStatus.LOCKED).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            // Error 401 para credenciales inválidas (para no dar pistas si el correo existe o no)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
        }
    }
}