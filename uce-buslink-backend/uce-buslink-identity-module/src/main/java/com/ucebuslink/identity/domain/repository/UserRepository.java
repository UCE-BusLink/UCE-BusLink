package com.ucebuslink.identity.domain.repository;

import com.ucebuslink.identity.domain.model.User;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository {

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    boolean existsByEmail(String email);

    User save(User user);

    Optional<User> findById(UUID id);
}