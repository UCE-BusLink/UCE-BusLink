package com.ucebuslink.identity.application.usecase;

import com.ucebuslink.identity.domain.model.User;
import com.ucebuslink.identity.domain.repository.UserRepository;
import com.ucebuslink.shared.constant.Role;
import com.ucebuslink.shared.constant.UserStatus;
import com.ucebuslink.shared.dto.CurrentUserResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Optional;

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
                .or(() -> relinkExistingUserByEmail(clerkUserId, email))
                .orElseGet(() -> createUser(
                        clerkUserId,
                        email,
                        firstName,
                        lastName));

        boolean needsOnboarding = user.getPhone() == null || user.getPhone().isEmpty() || 
                                  user.getDocumentNumber() == null || user.getDocumentNumber().isEmpty();

        return new CurrentUserResponse(
                user.getId().toString(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                needsOnboarding);
    }

    // Handles users whose local row already exists (e.g. drivers/admins provisioned by AdminService)
    // but whose Clerk ID no longer matches the JWT subject, instead of rejecting them
    // as a brand-new self-registration attempt.
    private Optional<User> relinkExistingUserByEmail(String clerkUserId, String email) {
        return userRepository.findByEmail(email).map(existing -> {
            log.warn("[AUTH] Relinking existing user {} (role {}) to new Clerk ID for email: {}",
                    existing.getId(), existing.getRole(), email);
            existing.setClerkUserId(clerkUserId);
            return userRepository.save(existing);
        });
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