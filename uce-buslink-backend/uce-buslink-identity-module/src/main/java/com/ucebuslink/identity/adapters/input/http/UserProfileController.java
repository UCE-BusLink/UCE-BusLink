package com.ucebuslink.identity.adapters.input.http;

import com.ucebuslink.identity.application.dto.profile.UserProfileResponse;
import com.ucebuslink.identity.application.usecase.GetUserProfileUseCase;
import com.ucebuslink.identity.domain.model.User;
import com.ucebuslink.identity.domain.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ucebuslink.identity.application.dto.profile.UpdateUserProfileRequest;
import com.ucebuslink.identity.application.usecase.UpdateUserProfileUseCase;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
public class UserProfileController {

    private final GetUserProfileUseCase getUserProfileUseCase;
    private final UpdateUserProfileUseCase updateUserProfileUseCase;
    private final UserRepository userRepository;

    public UserProfileController(GetUserProfileUseCase getUserProfileUseCase, UpdateUserProfileUseCase updateUserProfileUseCase, UserRepository userRepository) {
        this.getUserProfileUseCase = getUserProfileUseCase;
        this.updateUserProfileUseCase = updateUserProfileUseCase;
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal Jwt jwt) {
        String clerkUserId = jwt.getSubject(); // Clerk subject ID
        
        Optional<User> userOpt = userRepository.findByClerkUserId(clerkUserId);
        if (userOpt.isEmpty()) {
            // Fallback to email if clerkUserId is not set
            String email = jwt.getClaimAsString("email");
            if (email != null) {
                userOpt = userRepository.findByEmail(email);
            }
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return getUserProfileUseCase.execute(userOpt.get().getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> updateProfile(@AuthenticationPrincipal Jwt jwt, @RequestBody UpdateUserProfileRequest request) {
        String clerkUserId = jwt.getSubject();
        
        Optional<User> userOpt = userRepository.findByClerkUserId(clerkUserId);
        if (userOpt.isEmpty()) {
            String email = jwt.getClaimAsString("email");
            if (email != null) {
                userOpt = userRepository.findByEmail(email);
            }
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return updateUserProfileUseCase.execute(userOpt.get().getId(), request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
