package com.ucebuslink.notifications.infrastructure.external.fcm;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmNotificationAdapter {

    public void sendPushNotification(String fcmToken, String title, String body) {
        sendPushNotification(fcmToken, title, body, Map.of());
    }

    public void sendPushNotification(String fcmToken, String title, String body, Map<String, String> data) {
        if (fcmToken == null || fcmToken.isEmpty()) return;

        try {
            Message.Builder builder = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build());

            if (data != null && !data.isEmpty()) {
                builder.putAllData(data);
            }

            String response = FirebaseMessaging.getInstance().sendAsync(builder.build()).get();
            log.info("[FCM] Notificación enviada con éxito. Respuesta de Google: {}", response);

        } catch (Exception e) {
            log.error("[FCM] Fallo al enviar notificación push al token: {}. Razón: {}", fcmToken, e.getMessage());
        }
    }
}
