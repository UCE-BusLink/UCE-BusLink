package com.ucebuslink.identity.application.port;

public interface MicrosoftTokenVerifierPort {

    MicrosoftUserData verify(String token) throws Exception;

    record MicrosoftUserData(
            String email,
            String subject,
            String firstName,
            String lastName
    ) {
    }
}