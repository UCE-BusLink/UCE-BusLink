package com.ucebuslink.identity.application.usecase;

import com.ucebuslink.identity.application.port.MicrosoftTokenVerifierPort;
import com.ucebuslink.identity.application.service.TokenProviderPort;
import com.ucebuslink.identity.domain.model.User;
import com.ucebuslink.identity.domain.repository.UserRepository;
import com.ucebuslink.shared.constant.Role;
import com.ucebuslink.shared.constant.UserStatus;
import com.ucebuslink.shared.dto.AuthResponse;

import org.springframework.stereotype.Service;

@Service
public class MicrosoftLoginUseCase {

    private final UserRepository userRepository;

    private final TokenProviderPort tokenProvider;

    private final MicrosoftTokenVerifierPort microsoftVerifier;

    public MicrosoftLoginUseCase(
            UserRepository userRepository,
            TokenProviderPort tokenProvider,
            MicrosoftTokenVerifierPort microsoftVerifier
    ) {
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
        this.microsoftVerifier = microsoftVerifier;
    }

    public AuthResponse execute(String token)
            throws Exception {

        MicrosoftTokenVerifierPort.MicrosoftUserData data =
                microsoftVerifier.verify(token);

        if (data.email() == null ||
                !data.email().endsWith("@uce.edu.ec")) {

            throw new IllegalAccessException(
                    "Solo se permiten correos institucionales"
            );
        }

        User user = userRepository.findByEmail(data.email())
                .orElseGet(() -> {

                    User newUser = new User();

                    newUser.setEmail(data.email());
                    newUser.setGoogleId(data.subject());

                    newUser.setFirstName(data.firstName());
                    newUser.setLastName(data.lastName());

                    newUser.setRole(Role.STUDENT);
                    newUser.setStatus(UserStatus.ACTIVE);

                    return userRepository.save(newUser);
                });

        String jwt =
                tokenProvider.generateToken(user);

        return new AuthResponse(
                jwt,
                user.getEmail(),
                user.getRole().name()
        );
    }
}