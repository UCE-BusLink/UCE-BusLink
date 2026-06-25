package com.ucebuslink.identity.domain.repository;

import com.ucebuslink.identity.domain.model.User;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.ucebuslink.shared.constant.*;

public interface UserRepository {

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    boolean existsByEmail(String email);

    User save(User user);

    Optional<User> findById(UUID id);

    Optional<User> findByClerkUserId(String clerkUserId);

    Page<User> findUsersByRole(Role role, Pageable pageable);
}