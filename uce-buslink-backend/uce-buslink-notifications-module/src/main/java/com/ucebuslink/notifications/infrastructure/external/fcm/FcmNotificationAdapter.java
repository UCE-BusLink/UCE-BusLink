package com.ucebuslink.notifications.infrastructure.external.fcm;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmNotificationAdapter {

    public void sendPushNotification(String fcmToken, String title, String body) {
        if (fcmToken == null || fcmToken.isEmpty()) return;

        try {
            // Construimos el mensaje de Firebase
            Message message = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();

            // Enviamos el mensaje de forma asíncrona a Google
            String response = FirebaseMessaging.getInstance().sendAsync(message).get();
            log.info("[FCM] Notificación enviada con éxito. Respuesta de Google: {}", response);
            
        } catch (Exception e) {
            log.error("[FCM] Fallo al enviar notificación push al token: {}. Razón: {}", fcmToken, e.getMessage());
        }
    }
}