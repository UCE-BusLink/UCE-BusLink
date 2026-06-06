package com.ucebuslink.identity.infrastructure.external.google;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.ucebuslink.identity.application.port.GoogleTokenVerifierPort;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class GoogleTokenVerifierAdapter
        implements GoogleTokenVerifierPort {

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifierAdapter(
            @Value("${google.client.id}")
            String googleClientId
    ) {

        this.verifier =
                new GoogleIdTokenVerifier.Builder(
                        new NetHttpTransport(),
                        new GsonFactory()
                )
                        .setAudience(
                                Collections.singletonList(
                                        googleClientId
                                )
                        )
                        .build();
    }

    @Override
    public GoogleUserData verify(String token)
            throws Exception {

        GoogleIdToken idToken =
                verifier.verify(token);

        if (idToken == null) {

            throw new IllegalArgumentException(
                    "Invalid Google token"
            );
        }

        GoogleIdToken.Payload payload =
                idToken.getPayload();

        return new GoogleUserData(
                payload.getEmail(),
                payload.getSubject(),
                (String) payload.get("given_name"),
                (String) payload.get("family_name")
        );
    }
}