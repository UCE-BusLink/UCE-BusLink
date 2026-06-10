package com.ucebuslink.identity.application.usecase;

import com.ucebuslink.identity.domain.model.User;
import com.ucebuslink.identity.domain.repository.UserRepository;
import com.ucebuslink.shared.constant.Role;
import com.ucebuslink.shared.constant.UserStatus;
import com.ucebuslink.shared.dto.CurrentUserResponse;

import org.springframework.stereotype.Service;

@Service
public class SyncUserUseCase {

    private final UserRepository userRepository;

    public SyncUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public CurrentUserResponse execute(
            String clerkUserId,
            String email,
            String firstName,
            String lastName) {

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

        // SOLO estudiantes UCE
        if (!email.endsWith("@uce.edu.ec")) {

            throw new IllegalArgumentException(
                    "Solo se permiten correos institucionales UCE");
        }

        User user = new User();

        user.setClerkUserId(clerkUserId);

        user.setEmail(email);

        user.setFirstName(firstName);

        user.setLastName(lastName);

        user.setStatus(UserStatus.ACTIVE);

        user.setRole(Role.STUDENT);

        return userRepository.save(user);
    }

}