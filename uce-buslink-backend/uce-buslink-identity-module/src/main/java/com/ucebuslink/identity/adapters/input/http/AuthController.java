package com.ucebuslink.identity.adapters.input.http;

import com.ucebuslink.identity.application.usecase.GoogleLoginUseCase;
import com.ucebuslink.identity.application.usecase.LoginUseCase;
import com.ucebuslink.identity.application.usecase.MicrosoftLoginUseCase;

import com.ucebuslink.shared.dto.AuthResponse;
import com.ucebuslink.shared.dto.GoogleLoginRequest;
import com.ucebuslink.shared.dto.LoginRequest;
import com.ucebuslink.shared.dto.MicrosoftLoginRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final LoginUseCase loginUseCase;

    private final GoogleLoginUseCase googleLoginUseCase;

    private final MicrosoftLoginUseCase microsoftLoginUseCase;

    public AuthController(
            LoginUseCase loginUseCase,
            GoogleLoginUseCase googleLoginUseCase,
            MicrosoftLoginUseCase microsoftLoginUseCase
    ) {
        this.loginUseCase = loginUseCase;
        this.googleLoginUseCase = googleLoginUseCase;
        this.microsoftLoginUseCase = microsoftLoginUseCase;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        try {

            AuthResponse response =
                    loginUseCase.execute(
                            request.email(),
                            request.password()
                    );

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {

            return ResponseEntity
                    .status(HttpStatus.LOCKED)
                    .body(e.getMessage());

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Credenciales inválidas");
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(
            @RequestBody GoogleLoginRequest request
    ) {

        try {

            AuthResponse response =
                    googleLoginUseCase.execute(
                            request.idToken()
                    );

            return ResponseEntity.ok(response);

        } catch (IllegalAccessException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Error de autenticación");
        }
    }

    @PostMapping("/microsoft")
    public ResponseEntity<?> microsoftLogin(
            @RequestBody MicrosoftLoginRequest request
    ) {

        try {

            AuthResponse response =
                    microsoftLoginUseCase.execute(
                            request.accessToken()
                    );

            return ResponseEntity.ok(response);

        } catch (IllegalAccessException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Error de autenticación Microsoft");
        }
    }
}