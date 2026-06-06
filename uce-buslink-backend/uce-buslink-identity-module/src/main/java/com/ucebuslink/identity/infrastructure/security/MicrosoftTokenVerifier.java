package com.ucebuslink.identity.infrastructure.security;

import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.text.ParseException;

@Component
public class MicrosoftTokenVerifier {

    @Value("${microsoft.tenant.id}")
    private String tenantId;

    public SignedJWT verify(String token) throws ParseException {

        SignedJWT jwt = SignedJWT.parse(token);

        String issuer = jwt.getJWTClaimsSet().getIssuer();

        if (!issuer.contains(tenantId)) {
            throw new IllegalArgumentException("Tenant inválido");
        }

        return jwt;
    }
}