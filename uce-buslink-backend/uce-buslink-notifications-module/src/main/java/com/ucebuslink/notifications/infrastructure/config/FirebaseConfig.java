package com.ucebuslink.notifications.infrastructure.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Base64;

@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${firebase.credentials:}")
    private String firebaseCredentials;

    @Bean
    public FirebaseApp firebaseApp() {
        try {
            if (firebaseCredentials == null || firebaseCredentials.trim().isEmpty()) {
                log.warn("[FCM] FIREBASE_CREDENTIALS variable is empty. Firebase will not be initialized.");
                return null;
            }

            // Decodificar el contenido Base64 a JSON
            byte[] decodedCredentials = Base64.getDecoder().decode(firebaseCredentials);

            InputStream credentialsStream =
                    new ByteArrayInputStream(decodedCredentials);

            GoogleCredentials credentials =
                    GoogleCredentials.fromStream(credentialsStream);

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp app = FirebaseApp.initializeApp(options);
                log.info("[FCM] FirebaseApp inicializada correctamente: {}", app.getName());
                return app;
            }

            return FirebaseApp.getInstance();

        } catch (IllegalArgumentException e) {
            log.error("[FCM] The FIREBASE_CREDENTIALS variable does not contain valid Base64", e);
            return null;

        } catch (Exception e) {
            log.error("[FCM] Error inicializando Firebase", e);
            e.printStackTrace();
            return null;
        }
    }
}