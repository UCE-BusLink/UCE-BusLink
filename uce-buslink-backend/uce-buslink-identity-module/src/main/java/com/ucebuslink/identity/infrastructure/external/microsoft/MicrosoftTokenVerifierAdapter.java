package com.ucebuslink.identity.infrastructure.external.microsoft;

import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.ucebuslink.identity.application.port.MicrosoftTokenVerifierPort;
import com.ucebuslink.identity.infrastructure.security.MicrosoftTokenVerifier;

import org.springframework.stereotype.Component;

@Component
public class MicrosoftTokenVerifierAdapter
        implements MicrosoftTokenVerifierPort {

    private final MicrosoftTokenVerifier verifier;

    public MicrosoftTokenVerifierAdapter(
            MicrosoftTokenVerifier verifier
    ) {
        this.verifier = verifier;
    }

    @Override
    public MicrosoftUserData verify(String token)
            throws Exception {

        SignedJWT jwt =
                verifier.verify(token);

        JWTClaimsSet claims =
                jwt.getJWTClaimsSet();

        String email =
                extractEmail(claims);

        return new MicrosoftUserData(
                email,
                claims.getSubject(),
                (String) claims.getClaim("given_name"),
                (String) claims.getClaim("family_name")
        );
    }

    private String extractEmail(
            JWTClaimsSet claims
    ) throws Exception {

        String email =
                claims.getStringClaim(
                        "preferred_username"
                );

        if (email == null) {
            email = claims.getStringClaim("upn");
        }

        if (email == null) {
            email = claims.getStringClaim("unique_name");
        }

        if (email == null) {
            email = claims.getStringClaim("email");
        }

        return email;
    }
}