package com.ucebuslink.tracking.infrastructure.config;

import com.ucebuslink.tracking.infrastructure.websocket.JwtChannelInterceptor;
import com.ucebuslink.tracking.infrastructure.websocket.SubscriptionSecurityInterceptor;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99) // Nos aseguramos de que esta configuración de seguridad se aplique correctamente
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtChannelInterceptor jwtChannelInterceptor;
    private final SubscriptionSecurityInterceptor subscriptionSecurityInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Habilita el broker en memoria para los canales de suscripción (Estudiantes y Supervisor)
        config.enableSimpleBroker("/topic");
        
        // Prefijo para los mensajes que el cliente ENVÍA al servidor (Ej: el conductor enviando coordenadas)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint principal para la conexión del WebSocket según la documentación
        registry.addEndpoint("/ws/tracking")
                .setAllowedOriginPatterns("*"); // Permitir todos los orígenes (CORS) - En producción restringir a los dominios válidos
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(jwtChannelInterceptor, subscriptionSecurityInterceptor);
    }
}