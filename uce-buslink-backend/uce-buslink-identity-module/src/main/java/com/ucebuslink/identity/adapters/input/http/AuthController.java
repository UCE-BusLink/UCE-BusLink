package com.ucebuslink.identity.adapters.input.http;

import com.ucebuslink.identity.application.usecase.SyncUserUseCase;
import com.ucebuslink.shared.dto.CurrentUserResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

        private final SyncUserUseCase syncUserUseCase;

        public AuthController(
                        SyncUserUseCase syncUserUseCase) {
                this.syncUserUseCase = syncUserUseCase;
        }

        @GetMapping("/me")
        public ResponseEntity<?> me(
                        @AuthenticationPrincipal Jwt jwt) {

                CurrentUserResponse response = syncUserUseCase.execute(
                                jwt.getSubject(),
                                jwt.getClaimAsString("email"),
                                jwt.getClaimAsString("first_name"),
                                jwt.getClaimAsString("last_name"));

                return ResponseEntity.ok(response);
        }

        @PostMapping("/sync")
        public ResponseEntity<?> syncUser(
                        @AuthenticationPrincipal Jwt jwt) {

                String clerkUserId = jwt.getSubject();

                String email = jwt.getClaimAsString("email");

                String firstName = jwt.getClaimAsString("first_name");

                String lastName = jwt.getClaimAsString("last_name");

                CurrentUserResponse response = syncUserUseCase.execute(
                                clerkUserId,
                                email,
                                firstName,
                                lastName);

                System.out.println(jwt);

                return ResponseEntity.ok(response);
        }

        @GetMapping("/test-admin")
        @PreAuthorize("hasRole('ADMIN')")
        public String adminOnly() {
                System.out.println("Acceso permitido solo para ADMIN");
                return "ADMIN OK";
        }
}