package com.ucebuslink.notifications.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

public class DeviceToken {
    private UUID id;
    private UUID userId;
    private String fcmToken;
    private Platform platform;
    private LocalDateTime createdAt;
    private LocalDateTime lastActiveAt;

    public DeviceToken() {}

    public DeviceToken(UUID id, UUID userId, String fcmToken, Platform platform, LocalDateTime createdAt, LocalDateTime lastActiveAt) {
        this.id = id;
        this.userId = userId;
        this.fcmToken = fcmToken;
        this.platform = platform;
        this.createdAt = createdAt;
        this.lastActiveAt = lastActiveAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getFcmToken() { return fcmToken; }
    public void setFcmToken(String fcmToken) { this.fcmToken = fcmToken; }
    public Platform getPlatform() { return platform; }
    public void setPlatform(Platform platform) { this.platform = platform; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(LocalDateTime lastActiveAt) { this.lastActiveAt = lastActiveAt; }

    public static DeviceToken createNew(UUID userId, String fcmToken, Platform platform) {
        LocalDateTime now = LocalDateTime.now();
        return new DeviceToken(UUID.randomUUID(), userId, fcmToken, platform, now, now);
    }

    public void updateActivity() {
        this.lastActiveAt = LocalDateTime.now();
    }
}