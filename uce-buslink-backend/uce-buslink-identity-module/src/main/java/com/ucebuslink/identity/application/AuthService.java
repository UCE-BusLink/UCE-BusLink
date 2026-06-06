package com.ucebuslink.identity.application;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.ucebuslink.identity.application.security.JwtTokenProvider;
import com.ucebuslink.identity.domain.User;
import com.ucebuslink.identity.infrastructure.UserRepository;
import com.ucebuslink.shared.constant.Role;
import com.ucebuslink.shared.constant.UserStatus;
import com.ucebuslink.shared.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleIdTokenVerifier verifier;

    public AuthService(UserRepository userRepository, 
                       JwtTokenProvider jwtTokenProvider,
                       @Value("${google.client.id}") String googleClientId) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
    }

    public AuthResponse authenticateWithGoogle(String idTokenString) throws Exception {
        System.out.println("Token received in AuthService: " + idTokenString);

        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken == null) {
            throw new IllegalArgumentException("Invalid Google token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        System.out.println("Token payload: " + payload);

        String email = payload.getEmail();

        // 1. Validate institutional domain @uce.edu.ec
        if (!email.endsWith("@uce.edu.ec")) {
            throw new IllegalAccessException("Only institutional @uce.edu.ec emails are allowed");
        }

        // 2. Find user or create if first time
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setGoogleId(payload.getSubject());

            newUser.setFirstName((String) payload.get("given_name"));
            newUser.setLastName((String) payload.get("family_name"));

            newUser.setRole(Role.STUDENT); // Default role
            newUser.setStatus(UserStatus.ACTIVE);

            return userRepository.save(newUser);
        });

        // 3. Generate JWT
        String jwt = jwtTokenProvider.generateToken(user);

        return new AuthResponse(jwt, user.getEmail(), user.getRole().name());
    }
}