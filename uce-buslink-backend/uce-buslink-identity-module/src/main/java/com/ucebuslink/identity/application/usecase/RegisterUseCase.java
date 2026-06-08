package com.ucebuslink.identity.application.usecase;

import com.ucebuslink.identity.application.service.PasswordEncoderPort;
import com.ucebuslink.identity.application.service.TokenProviderPort;
import com.ucebuslink.identity.domain.model.User;
import com.ucebuslink.identity.domain.repository.UserRepository;
import com.ucebuslink.shared.constant.Role;
import com.ucebuslink.shared.constant.UserStatus;
import com.ucebuslink.shared.dto.AuthResponse;

import org.springframework.stereotype.Service;

@Service
public class RegisterUseCase {

    private final UserRepository userRepository;

    private final PasswordEncoderPort passwordEncoder;

    private final TokenProviderPort tokenProvider;

    public RegisterUseCase(
            UserRepository userRepository,
            PasswordEncoderPort passwordEncoder,
            TokenProviderPort tokenProvider
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse execute(
            String firstName,
            String lastName,
            String email,
            String password
    ) {

        if (firstName == null || firstName.isBlank()
                || lastName == null || lastName.isBlank()
                || email == null || email.isBlank()
                || password == null || password.isBlank()) {

            throw new IllegalArgumentException(
                    "Todos los campos son obligatorios"
            );
        }

        if (password.length() < 6) {

            throw new IllegalArgumentException(
                    "La contraseña debe tener al menos 6 caracteres"
            );
        }

        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {

            throw new IllegalStateException(
                    "El correo ya está registrado"
            );
        }

        User user = new User();

        user.setEmail(normalizedEmail);
        user.setFirstName(firstName.trim());
        user.setLastName(lastName.trim());
        user.setRole(Role.STUDENT);
        user.setStatus(UserStatus.ACTIVE);
        user.setPasswordHash(passwordEncoder.encode(password));

        User saved = userRepository.save(user);

        String token = tokenProvider.generateToken(saved);

        return new AuthResponse(
                token,
                saved.getEmail(),
                saved.getRole().name()
        );
    }
}
