package com.ucebuslink.identity.infrastructure.security;

import com.ucebuslink.identity.domain.model.User;
import com.ucebuslink.identity.domain.repository.UserRepository;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class CustomJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UserRepository userRepository;

    public CustomJwtAuthenticationConverter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {

        String clerkUserId = jwt.getSubject();
        Optional<User> userOpt = userRepository.findByClerkUserId(clerkUserId);

        // Usuario NO sincronizado
        if (userOpt.isEmpty()) {

            return new JwtAuthenticationToken(
                    jwt,
                    List.of(new SimpleGrantedAuthority("ROLE_UNSYNCED")),
                    clerkUserId
            );
        }

        // Usuario sincronizado
        User user = userOpt.get();

        SimpleGrantedAuthority authority =
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name());

        JwtAuthenticationToken token =
                new JwtAuthenticationToken(
                        jwt,
                        List.of(authority),
                        clerkUserId
                );

        // ⭐ AQUÍ guardas el UUID interno SIN romper nada
        token.setDetails(user.getId());

        return token;
    }
}