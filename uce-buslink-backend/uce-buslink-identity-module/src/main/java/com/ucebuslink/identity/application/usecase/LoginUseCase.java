package com.ucebuslink.identity.application.usecase;

import com.ucebuslink.identity.application.service.PasswordEncoderPort;
import com.ucebuslink.identity.application.service.TokenProviderPort;
import com.ucebuslink.identity.domain.model.User;
import com.ucebuslink.identity.domain.repository.UserRepository;
import com.ucebuslink.shared.dto.AuthResponse;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class LoginUseCase {

    private final UserRepository userRepository;

    private final PasswordEncoderPort passwordEncoder;

    private final TokenProviderPort tokenProvider;

    public LoginUseCase(
            UserRepository userRepository,
            PasswordEncoderPort passwordEncoder,
            TokenProviderPort tokenProvider
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse execute(
            String email,
            String password
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("Credenciales inválidas"));

        if (user.isLocked()) {

            throw new IllegalStateException(
                    "Cuenta bloqueada temporalmente"
            );
        }

        if (!passwordEncoder.matches(
                password,
                user.getPasswordHash()
        )) {

            user.increaseFailedAttempts();

            userRepository.save(user);

            throw new IllegalArgumentException(
                    "Credenciales inválidas"
            );
        }

        user.resetLoginAttempts();

        user.setLastLoginAt(LocalDateTime.now());

        userRepository.save(user);

        String token =
                tokenProvider.generateToken(user);

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getRole().name()
        );
    }
}