package com.ucebuslink.identity.application;

import com.ucebuslink.identity.application.dto.UserResponse;
import com.ucebuslink.identity.domain.model.User;
import com.ucebuslink.identity.domain.repository.UserRepository;
import com.ucebuslink.identity.infrastructure.external.clerk.ClerkClient;
import com.ucebuslink.shared.constant.Role;
import com.ucebuslink.shared.constant.UserStatus;
import com.ucebuslink.shared.dto.CreateDriverRequest;
import com.ucebuslink.shared.dto.DriverCreatedResponse;

import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final ClerkClient clerkClient;

    public AdminService(UserRepository userRepository, ClerkClient clerkClient) {
        this.userRepository = userRepository;
        this.clerkClient = clerkClient;
    }

    @Transactional
    public DriverCreatedResponse createDriver(CreateDriverRequest request) {
        
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("The email is already registered in the local system");
        }

        String clerkUserId;
        try {
            
            clerkUserId = clerkClient.createUser(
                    request.email(),
                    request.password(), 
                    request.nombres(),
                    request.apellidos()
            );
        } catch (Exception e) {
            throw new RuntimeException("Error creating driver in Clerk: " + e.getMessage());
        }

        User driver = new User();
        driver.setFirstName(request.nombres());
        driver.setLastName(request.apellidos());
        driver.setEmail(request.email());
        driver.setRole(Role.DRIVER); 
        driver.setStatus(UserStatus.ACTIVE);
        driver.setFailedLoginAttempts(0);
        
        driver.setClerkUserId(clerkUserId);

        User savedDriver = userRepository.save(driver);

        return new DriverCreatedResponse(
                savedDriver.getId(),
                savedDriver.getEmail(),
                "Driver successfully created in Clerk and local DB"
        );
    }

    public Page<UserResponse> getAllDrivers(int page, int size) { 
        log.info("[APP-IDENTITY] Querying paginated list of all drivers. Page: {}, Size: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        
        return userRepository.findUsersByRole(Role.DRIVER, pageable)
                .map(this::toResponse); // Map from Domain to DTO
    }

    // MANUAL MAPPING: From Domain to DTO
    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getDocumentNumber(),
                user.getPhone()
        );
    }
}