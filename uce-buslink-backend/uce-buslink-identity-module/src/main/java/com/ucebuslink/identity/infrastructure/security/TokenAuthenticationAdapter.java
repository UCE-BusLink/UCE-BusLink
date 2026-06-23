package com.ucebuslink.identity.infrastructure.security;

import com.ucebuslink.shared.security.TokenAuthenticationPort;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;

@Component
public class TokenAuthenticationAdapter implements TokenAuthenticationPort {

    private final JwtDecoder jwtDecoder;
    private final CustomJwtAuthenticationConverter converter;

    public TokenAuthenticationAdapter(JwtDecoder jwtDecoder, CustomJwtAuthenticationConverter converter) {
        this.jwtDecoder = jwtDecoder;
        this.converter = converter;
    }

    @Override
    public Authentication authenticate(String token) {
        // 1. Decodifica y valida la firma (Clerk)
        Jwt jwt = jwtDecoder.decode(token);
        
        // 2. Convierte usando tu lógica de BD (Asigna ROLE_STUDENT, ROLE_DRIVER, etc.)
        // Esto garantiza que WS y HTTP usen EXACTAMENTE las mismas reglas y roles
        return converter.convert(jwt);
    }
}