package com.ucebuslink.tracking.infrastructure.websocket;

import com.ucebuslink.shared.security.TokenAuthenticationPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    // 🔥 Desacoplamiento total: Usamos el contrato del Shared Kernel
    private final TokenAuthenticationPort tokenAuthenticationPort;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.debug("[WEBSOCKET-SECURITY] Intento de conexión STOMP interceptado.");

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
                // 👉 La magia del Bounded Context: Tracking confía en Identity para la auth
                Authentication userAuth = tokenAuthenticationPort.authenticate(token);
                
                accessor.setUser(userAuth);
                log.info("[WEBSOCKET-SECURITY] Conexión STOMP autorizada para: {} con roles: {}", 
                        userAuth.getName(), userAuth.getAuthorities());

            } catch (Exception e) {
                log.error("[WEBSOCKET-SECURITY] Conexión rechazada: Token inválido o problema de identidad.", e);
                throw new IllegalArgumentException("Autenticación inválida o expirada.");
            }
        }

        return message;
    }
}