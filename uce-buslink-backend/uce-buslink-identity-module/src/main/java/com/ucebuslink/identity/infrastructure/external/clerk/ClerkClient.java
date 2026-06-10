package com.ucebuslink.identity.infrastructure.external.clerk;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
public class ClerkClient {

    @Value("${clerk.secret.key}")
    private String clerkSecretKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String createUser(String email, String password, String firstName, String lastName) {
        String url = "https://api.clerk.com/v1/users";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(clerkSecretKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Clerk espera que email_address sea un arreglo
        Map<String, Object> body = Map.of(
                "email_address", List.of(email),
                "password", password,
                "first_name", firstName,
                "last_name", lastName,
                "skip_password_checks", true // Opcional: útil si generas contraseñas automáticas
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("id")) {
                return (String) response.getBody().get("id");
            }
            throw new RuntimeException("Respuesta inválida de Clerk al crear conductor");
        } catch (Exception e) {
            throw new RuntimeException("Error comunicándose con la API de Clerk: " + e.getMessage());
        }
    }
}