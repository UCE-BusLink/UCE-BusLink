package com.ucebuslink.shared.security;

import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public final class CurrentUserProvider {

    private CurrentUserProvider() {
    }

    public static UUID requireUserId(Authentication authentication) {
        if (authentication != null && authentication.getDetails() instanceof UUID userId) {
            return userId;
        }
        throw new InsufficientAuthenticationException(
                "La cuenta no está sincronizada. Vuelve a iniciar sesión e intenta nuevamente.");
    }
}
