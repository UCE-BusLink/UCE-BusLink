package com.ucebuslink.identity.infrastructure.security;

import com.ucebuslink.identity.application.service.TokenProviderPort;
import com.ucebuslink.identity.domain.model.User;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider implements TokenProviderPort {

    @Value("${jwt.secret:defaultSecretKeyThatIsVeryLongAndSecure1234567890}")
    private String jwtSecret;

    @Value("${jwt.expiration.ms:900000}")
    private int jwtExpirationMs;

    private Key getSigningKey() {

        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    @Override
    public String generateToken(User user) {

        Date now = new Date();

        Date expiryDate =
                new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUserIdFromJWT(String token) {

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {

        try {

            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(authToken);

            return true;

        } catch (JwtException | IllegalArgumentException ex) {

            return false;
        }
    }

    public String getRoleFromJWT(String token) {

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("role", String.class);
    }
}