package com.ucebuslink.identity.application.usecase;

import com.ucebuslink.identity.domain.model.User;
import com.ucebuslink.identity.domain.repository.UserRepository;
import com.ucebuslink.shared.constant.Role;
import com.ucebuslink.shared.constant.UserStatus;
import com.ucebuslink.shared.dto.CurrentUserResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SyncUserUseCase {

    private static final Logger log = LoggerFactory.getLogger(SyncUserUseCase.class);
    private final UserRepository userRepository;

    public SyncUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public CurrentUserResponse execute(
            String clerkUserId,
            String email,
            String firstName,
            String lastName) {

        log.debug("[AUTH] Executing SyncUserUseCase for email: {}", email);

        User user = userRepository
                .findByClerkUserId(clerkUserId)
                .orElseGet(() -> createUser(
                        clerkUserId,
                        email,
                        firstName,
                        lastName));

        return new CurrentUserResponse(
                user.getId().toString(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name());
    }

    private User createUser(
            String clerkUserId,
            String email,
            String firstName,
            String lastName) {

        // Only UCE students allowed
        if (!email.endsWith("@uce.edu.ec")) {
            log.warn("[AUTH] Rejected user creation. Email {} does not belong to the UCE domain.", email);
            throw new IllegalArgumentException(
                    "Solo se permiten correos institucionales UCE");
        }

        log.info("[AUTH] Creating new STUDENT user in database for email: {}", email);

        User user = new User();
        user.setClerkUserId(clerkUserId);
        user.setEmail(email);
        user.setFirstName(firstName != null ? firstName : "");
        user.setLastName(lastName != null ? lastName : "");
        user.setStatus(UserStatus.ACTIVE);
        user.setRole(Role.STUDENT);

        User savedUser = userRepository.save(user);
        log.info("[AUTH] User created successfully with internal ID: {}", savedUser.getId());
        
        return savedUser;
    }
}