package com.ucebuslink.identity.application;

import com.ucebuslink.identity.domain.model.User;
import com.ucebuslink.identity.domain.repository.UserRepository;
import com.ucebuslink.identity.infrastructure.external.clerk.ClerkClient;
import com.ucebuslink.shared.constant.Role;
import com.ucebuslink.shared.constant.UserStatus;
import com.ucebuslink.shared.dto.CreateDriverRequest;
import com.ucebuslink.shared.dto.DriverCreatedResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
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
            throw new IllegalArgumentException("El correo ya está registrado en el sistema local");
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
            throw new RuntimeException("Error al crear el conductor en Clerk: " + e.getMessage());
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
                "Conductor creado exitosamente en Clerk y BD local"
        );
    }
}