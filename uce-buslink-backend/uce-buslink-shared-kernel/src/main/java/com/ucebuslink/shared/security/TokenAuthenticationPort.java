package com.ucebuslink.shared.security;

import org.springframework.security.core.Authentication;

/**
 * Puerto de Shared Kernel: Tracking usa esto, Identity lo implementa.
 * Garantiza la separación de Bounded Contexts.
 */
public interface TokenAuthenticationPort {
    Authentication authenticate(String token);
}