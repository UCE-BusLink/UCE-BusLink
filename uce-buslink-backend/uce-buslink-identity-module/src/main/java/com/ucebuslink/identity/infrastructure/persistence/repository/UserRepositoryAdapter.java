package com.ucebuslink.identity.infrastructure.persistence.repository;

import com.ucebuslink.identity.domain.model.User;
import com.ucebuslink.identity.domain.repository.UserRepository;
import com.ucebuslink.identity.infrastructure.persistence.entity.UserJpaEntity;
import com.ucebuslink.identity.infrastructure.persistence.mapper.UserMapper;

import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class UserRepositoryAdapter implements UserRepository {

    private final JpaUserRepository repository;

    public UserRepositoryAdapter(JpaUserRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<User> findByEmail(String email) {

        return repository.findByEmail(email)
                .map(UserMapper::toDomain);
    }

    @Override
    public Optional<User> findByGoogleId(String googleId) {

        return repository.findByGoogleId(googleId)
                .map(UserMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {

        return repository.existsByEmail(email);
    }

    @Override
    public User save(User user) {

        UserJpaEntity entity =
                UserMapper.toEntity(user);

        UserJpaEntity saved =
                repository.save(entity);

        return UserMapper.toDomain(saved);
    }

    @Override
    public Optional<User> findById(UUID id) {

        return repository.findById(id)
                .map(UserMapper::toDomain);
    }
}