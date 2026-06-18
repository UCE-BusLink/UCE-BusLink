package com.ucebuslink.identity.infrastructure.persistence.mapper;

import com.ucebuslink.identity.domain.model.User;
import com.ucebuslink.identity.infrastructure.persistence.entity.UserJpaEntity;

public class UserMapper {

    private UserMapper() {
    }

    public static User toDomain(UserJpaEntity entity) {

        return new User(
                entity.getId(),
                entity.getEmail(),
                entity.getFirstName(),
                entity.getLastName(),
                entity.getRole(),
                entity.getStatus(),
                entity.getGoogleId(),
                entity.getClerkUserId(),
                entity.getPasswordHash(),
                entity.getLastLoginAt(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getFailedLoginAttempts(),
                entity.getLockoutExpiration()
        );
    }

    public static UserJpaEntity toEntity(User user) {

        return UserJpaEntity.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .status(user.getStatus())
                .googleId(user.getGoogleId())
                .clerkUserId(user.getClerkUserId())
                .passwordHash(user.getPasswordHash())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .failedLoginAttempts(user.getFailedLoginAttempts())
                .lockoutExpiration(user.getLockoutExpiration())
                .build();
    }
}