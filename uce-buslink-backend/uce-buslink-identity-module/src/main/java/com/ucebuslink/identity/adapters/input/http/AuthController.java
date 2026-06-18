package com.ucebuslink.identity.adapters.input.http;

import com.ucebuslink.identity.application.usecase.SyncUserUseCase;
import com.ucebuslink.shared.dto.CurrentUserResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final SyncUserUseCase syncUserUseCase;

    public AuthController(SyncUserUseCase syncUserUseCase) {
        this.syncUserUseCase = syncUserUseCase;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        log.debug("[AUTH] Fetching current profile for user: {}", email);

        CurrentUserResponse response = syncUserUseCase.execute(
                jwt.getSubject(),
                email,
                jwt.getClaimAsString("first_name"),
                jwt.getClaimAsString("last_name"));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncUser(@AuthenticationPrincipal Jwt jwt) {
        String clerkUserId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        String firstName = jwt.getClaimAsString("first_name");
        String lastName = jwt.getClaimAsString("last_name");

        log.info("[AUTH] Starting sync for user email: {} and ClerkID: {}", email, clerkUserId);

        try {
            CurrentUserResponse response = syncUserUseCase.execute(clerkUserId, email, firstName, lastName);
            log.info("[AUTH] Sync successful for user: {}", email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("[AUTH] Critical error syncing user {}: ", email, e);
            throw e; 
        }
    }

    @GetMapping("/test-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminOnly(@AuthenticationPrincipal Jwt jwt) {
        log.info("[SECURITY] Validated access to ADMIN test endpoint for user: {}", jwt.getSubject());
        return "ADMIN OK";
    }
}