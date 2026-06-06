package com.ucebuslink.identity.application;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.ucebuslink.identity.application.security.JwtTokenProvider;
import com.ucebuslink.identity.application.security.MicrosoftTokenVerifier;
import com.ucebuslink.identity.domain.User;
import com.ucebuslink.identity.infrastructure.UserRepository;
import com.ucebuslink.shared.constant.Role;
import com.ucebuslink.shared.constant.UserStatus;
import com.ucebuslink.shared.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

import java.util.Collections;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleIdTokenVerifier verifier;
    private final PasswordEncoder passwordEncoder;
    private final MicrosoftTokenVerifier microsoftTokenVerifier;

    public AuthService(UserRepository userRepository, 
                       JwtTokenProvider jwtTokenProvider,
                       PasswordEncoder passwordEncoder,
                       MicrosoftTokenVerifier microsoftTokenVerifier,
                       @Value("${google.client.id}") String googleClientId) {

        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.microsoftTokenVerifier = microsoftTokenVerifier;

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

        // 1. Validate institutional domain @gmail.com
        if (!email.endsWith("@gmail.com")) {
            throw new IllegalAccessException("Only institutional @gmail.com emails are allowed");
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

    public AuthResponse loginWithCredentials(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas"));

        // 1. Verificar si la cuenta está bloqueada temporalmente
        if (user.getLockoutExpiration() != null && user.getLockoutExpiration().isAfter(LocalDateTime.now())) {
            throw new IllegalStateException("Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intente en 15 minutos.");
        }

        // 2. Verificar la contraseña con Bcrypt
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            
            // Bloquear por 15 minutos si llega a 5 intentos
            if (user.getFailedLoginAttempts() >= 5) {
                user.setLockoutExpiration(LocalDateTime.now().plusMinutes(15));
            }
            userRepository.save(user);
            throw new IllegalArgumentException("Credenciales inválidas");
        }

        // 3. Login exitoso: Resetear contadores y limpiar bloqueo
        user.setFailedLoginAttempts(0);
        user.setLockoutExpiration(null);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // 4. Generar y devolver el JWT
        String jwt = jwtTokenProvider.generateToken(user);
        return new AuthResponse(jwt, user.getEmail(), user.getRole().name());
    }

    public AuthResponse authenticateWithMicrosoft(String accessToken) throws Exception {

        SignedJWT jwt = microsoftTokenVerifier.verify(accessToken);

        JWTClaimsSet claims;
        claims = jwt.getJWTClaimsSet();

        String email = extractMicrosoftEmail(claims);

        System.out.println("Microsoft token claims: " + claims);
        System.out.println("Extracted email from Microsoft token: " + email);

        if (email == null || !email.endsWith("@uce.edu.ec")) {
            throw new IllegalAccessException("Solo se permiten correos institucionales");
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setGoogleId(claims.getSubject());

            newUser.setFirstName((String) claims.getClaim("given_name"));
            newUser.setLastName((String) claims.getClaim("family_name"));

            newUser.setRole(Role.STUDENT);
            newUser.setStatus(UserStatus.ACTIVE);

            return userRepository.save(newUser);
        });

        String internalJwt = jwtTokenProvider.generateToken(user);

        return new AuthResponse(internalJwt, user.getEmail(), user.getRole().name());
    }

    private String extractMicrosoftEmail(JWTClaimsSet claims) throws Exception {

        String email = claims.getStringClaim("preferred_username");

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