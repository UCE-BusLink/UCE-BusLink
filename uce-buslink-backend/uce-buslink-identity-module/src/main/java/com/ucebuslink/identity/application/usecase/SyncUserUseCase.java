package com.ucebuslink.identity.application.usecase;

import com.ucebuslink.identity.domain.model.User;
import com.ucebuslink.identity.domain.repository.UserRepository;
import com.ucebuslink.shared.constant.Role;
import com.ucebuslink.shared.constant.UserStatus;
import com.ucebuslink.shared.dto.CurrentUserResponse;
import com.ucebuslink.shared.exception.UserNotFoundException;

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
                .orElseGet(() -> registerStudent(
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

    // Self-registration is only for UCE students. Any other email (e.g. a driver that
    // exists in Clerk but was never provisioned in this environment's DB) is rejected
    // instead of being silently created as a STUDENT.
    private User registerStudent(
            String clerkUserId,
            String email,
            String firstName,
            String lastName) {

        if (!email.endsWith("@uce.edu.ec")) {
            log.warn("[AUTH] No local account found for email {} and self-registration is students-only.", email);
            throw new UserNotFoundException("No existe una cuenta registrada para el correo " + email);
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
