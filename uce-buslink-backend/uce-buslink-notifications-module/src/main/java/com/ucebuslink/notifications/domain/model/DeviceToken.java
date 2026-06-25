package com.ucebuslink.notifications.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class DeviceToken {
    private UUID id;
    private UUID userId;
    private String fcmToken;
    private Platform platform;
    private LocalDateTime createdAt;
    private LocalDateTime lastActiveAt;

    public static DeviceToken createNew(UUID userId, String fcmToken, Platform platform) {
        LocalDateTime now = LocalDateTime.now();
        return new DeviceToken(UUID.randomUUID(), userId, fcmToken, platform, now, now);
    }

    public void updateActivity() {
        this.lastActiveAt = LocalDateTime.now();
    }
}