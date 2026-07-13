package com.ucebuslink.notifications.infrastructure.external.fcm;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class FcmNotificationAdapter {

    private static final Logger log = LoggerFactory.getLogger(FcmNotificationAdapter.class);

    public FcmNotificationAdapter() {}

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
            log.info("[FCM] Notification sent successfully. Response from Google: {}", response);

        } catch (Exception e) {
            log.error("[FCM] Failed to send push notification to token: {}. Reason: {}", fcmToken, e.getMessage());
        }
    }
}
