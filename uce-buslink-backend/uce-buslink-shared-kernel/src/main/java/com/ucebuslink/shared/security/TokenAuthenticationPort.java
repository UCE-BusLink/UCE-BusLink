package com.ucebuslink.shared.security;

import org.springframework.security.core.Authentication;

/**
 * Shared Kernel port: Tracking depends on this, Identity implements it.
 * Enforces the separation between Bounded Contexts.
 */
public interface TokenAuthenticationPort {
    Authentication authenticate(String token);
}