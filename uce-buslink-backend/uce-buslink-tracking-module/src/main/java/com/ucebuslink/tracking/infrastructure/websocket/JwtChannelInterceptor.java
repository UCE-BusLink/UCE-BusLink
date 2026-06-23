package com.ucebuslink.tracking.infrastructure.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder; // O tu servicio de validación de tokens personalizado (ej. ClerkClient)

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // Solo validamos el token en el momento de la conexión (Handshake)
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.debug("[WEBSOCKET-SECURITY] Intento de conexión STOMP interceptado.");

            // 1. Extraer JWT del header Authorization
            List<String> authorizationHeaders = accessor.getNativeHeader("Authorization");
            
            if (authorizationHeaders == null || authorizationHeaders.isEmpty()) {
                log.warn("[WEBSOCKET-SECURITY] Conexión rechazada: Header Authorization ausente.");
                throw new IllegalArgumentException("Header Authorization es obligatorio para conectar al WebSocket.");
            }

            String bearerToken = authorizationHeaders.get(0);
            if (!bearerToken.startsWith("Bearer ")) {
                log.warn("[WEBSOCKET-SECURITY] Conexión rechazada: Formato de token inválido.");
                throw new IllegalArgumentException("El token debe empezar con 'Bearer '.");
            }

            String token = bearerToken.substring(7);

            try {
                // 2. Validar firma y expiración del JWT
                Jwt jwt = jwtDecoder.decode(token);
                
                // 3. Extraer roles del JWT (Ajusta la clave "roles" según cómo lo envíe tu Identity Module o Clerk)
                List<String> roles = jwt.getClaimAsStringList("roles");
                if (roles == null || roles.isEmpty()) {
                    log.warn("[WEBSOCKET-SECURITY] Conexión rechazada: El usuario no tiene roles asignados.");
                    throw new IllegalArgumentException("Usuario sin roles no puede conectar.");
                }

                List<SimpleGrantedAuthority> authorities = roles.stream()
                        .map(role -> new SimpleGrantedAuthority(role.startsWith("ROLE_") ? role : "ROLE_" + role))
                        .collect(Collectors.toList());

                // 4. Crear la autenticación y asignarla a la sesión WebSocket
                Authentication userAuth = new UsernamePasswordAuthenticationToken(
                        jwt.getSubject(), // El ID del usuario (UUID de Clerk o Google)
                        null,
                        authorities
                );
                
                accessor.setUser(userAuth);
                log.info("[WEBSOCKET-SECURITY] Conexión STOMP autorizada para el usuario: {} con roles: {}", jwt.getSubject(), roles);

            } catch (JwtException e) {
                log.error("[WEBSOCKET-SECURITY] Conexión rechazada: Token JWT inválido o expirado.", e);
                throw new IllegalArgumentException("Token JWT inválido o expirado.");
            }
        }

        return message; // Deja pasar el mensaje si todo está bien
    }
}