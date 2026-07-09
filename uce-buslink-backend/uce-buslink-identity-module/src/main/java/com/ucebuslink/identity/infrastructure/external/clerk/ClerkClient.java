package com.ucebuslink.identity.infrastructure.external.clerk;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
public class ClerkClient {

    private static final Logger log = LoggerFactory.getLogger(ClerkClient.class);

    @Value("${clerk.secret.key}")
    private String clerkSecretKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @SuppressWarnings("rawtypes")
    public String createUser(String email, String password, String firstName, String lastName) {
        log.info("[CLERK] Attempting to create user in external provider for email: {}", email);
        
        String url = "https://api.clerk.com/v1/users";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(clerkSecretKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "email_address", List.of(email),
                "password", password,
                "first_name", firstName,
                "last_name", lastName,
                "skip_password_checks", true
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("id")) {
                String clerkId = (String) response.getBody().get("id");
                log.info("[CLERK] User successfully created in Clerk with ID: {}", clerkId);
                return clerkId;
            }
            
            // HTTP 200 without ID
            log.error("[CLERK] Invalid response payload from Clerk. Missing 'id' for email: {}", email);
            throw new RuntimeException("Invalid response from Clerk when creating driver");

        } catch (Exception e) {
            // CRITICAL
            log.error("[CLERK] Critical network/API error communicating with Clerk for email {}: ", email, e);
            throw new RuntimeException("Error communicating with the Clerk API: " + e.getMessage());
        }
    }
}