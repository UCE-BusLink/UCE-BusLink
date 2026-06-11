package com.ucebuslink.identity.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ucebuslink.shared.constant.Role;
import com.ucebuslink.shared.constant.UserStatus;

public class User {

    private UUID id;

    private String email;

    private String firstName;

    private String lastName;

    private Role role;

    private UserStatus status;

    private String googleId;

    private String clerkUserId;

    private String passwordHash;

    private LocalDateTime lastLoginAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private int failedLoginAttempts;

    private LocalDateTime lockoutExpiration;

    public User() {
    }

    public User(
            UUID id,
            String email,
            String firstName,
            String lastName,
            Role role,
            UserStatus status,
            String googleId,
            String clerkUserId,
            String passwordHash,
            LocalDateTime lastLoginAt,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            int failedLoginAttempts,
            LocalDateTime lockoutExpiration
    ) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.status = status;
        this.googleId = googleId;
        this.clerkUserId = clerkUserId;
        this.passwordHash = passwordHash;
        this.lastLoginAt = lastLoginAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.failedLoginAttempts = failedLoginAttempts;
        this.lockoutExpiration = lockoutExpiration;
    }

    public boolean isLocked() {
        return lockoutExpiration != null &&
                lockoutExpiration.isAfter(LocalDateTime.now());
    }

    public void increaseFailedAttempts() {
        this.failedLoginAttempts++;

        if (this.failedLoginAttempts >= 5) {
            this.lockoutExpiration = LocalDateTime.now().plusMinutes(15);
        }
    }

    public void resetLoginAttempts() {
        this.failedLoginAttempts = 0;
        this.lockoutExpiration = null;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public String getClerkUserId() {
        return clerkUserId;
    }

    public void setClerkUserId(String clerkUserId) {
        this.clerkUserId = clerkUserId;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(int failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public LocalDateTime getLockoutExpiration() {
        return lockoutExpiration;
    }

    public void setLockoutExpiration(LocalDateTime lockoutExpiration) {
        this.lockoutExpiration = lockoutExpiration;
    }
}