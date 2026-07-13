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

    // 🔥 Full decoupling: We use the Shared Kernel contract
    private final TokenAuthenticationPort tokenAuthenticationPort;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.debug("[WEBSOCKET-SECURITY] STOMP connection attempt intercepted.");

            List<String> authorizationHeaders = accessor.getNativeHeader("Authorization");
            
            if (authorizationHeaders == null || authorizationHeaders.isEmpty()) {
                log.warn("[WEBSOCKET-SECURITY] Connection rejected: Authorization header missing.");
                throw new IllegalArgumentException("Authorization header is required to connect to the WebSocket.");
            }

            String bearerToken = authorizationHeaders.get(0);
            if (!bearerToken.startsWith("Bearer ")) {
                log.warn("[WEBSOCKET-SECURITY] Connection rejected: Invalid token format.");
                throw new IllegalArgumentException("The token must start with 'Bearer '.");
            }

            String token = bearerToken.substring(7);

            try {
                // 👉 The Bounded Context magic: Tracking trusts Identity for auth
                Authentication userAuth = tokenAuthenticationPort.authenticate(token);
                
                accessor.setUser(userAuth);
                log.info("[WEBSOCKET-SECURITY] STOMP connection authorized for: {} with roles: {}",
                        userAuth.getName(), userAuth.getAuthorities());

            } catch (Exception e) {
                log.error("[WEBSOCKET-SECURITY] Connection rejected: Invalid token or identity issue.", e);
                throw new IllegalArgumentException("Invalid or expired authentication.");
            }
        }

        return message;
    }
}