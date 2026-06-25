package com.ucebuslink.identity.infrastructure.persistence.repository;

import com.ucebuslink.identity.infrastructure.persistence.entity.UserJpaEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ucebuslink.shared.constant.*;

import java.util.Optional;
import java.util.UUID;

public interface JpaUserRepository extends JpaRepository<UserJpaEntity, UUID> {

    Optional<UserJpaEntity> findByEmail(String email);

    Optional<UserJpaEntity> findByGoogleId(String googleId);

    boolean existsByEmail(String email);

    Optional<UserJpaEntity> findByClerkUserId(String clerkUserId);

    Page<UserJpaEntity> findByRole(Role role, Pageable pageable);
}