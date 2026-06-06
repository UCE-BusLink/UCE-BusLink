package com.ucebuslink.identity.infrastructure.security;

import com.ucebuslink.identity.application.service.PasswordEncoderPort;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class BcryptPasswordEncoderAdapter
        implements PasswordEncoderPort {

    private final PasswordEncoder passwordEncoder;

    public BcryptPasswordEncoderAdapter(
            PasswordEncoder passwordEncoder
    ) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public boolean matches(
            String rawPassword,
            String encodedPassword
    ) {
        return passwordEncoder.matches(
                rawPassword,
                encodedPassword
        );
    }

    @Override
    public String encode(String rawPassword) {

        return passwordEncoder.encode(rawPassword);
    }
}