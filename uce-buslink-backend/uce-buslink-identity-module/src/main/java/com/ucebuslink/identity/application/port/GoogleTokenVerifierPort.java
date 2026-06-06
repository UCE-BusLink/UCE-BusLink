package com.ucebuslink.identity.application.port;

public interface GoogleTokenVerifierPort {

    GoogleUserData verify(String token) throws Exception;

    record GoogleUserData(
            String email,
            String subject,
            String firstName,
            String lastName
    ) {
    }
}