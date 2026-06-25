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

    public Page<UserResponse> getAllDrivers(int page, int size) { 
        log.info("[APP-IDENTITY] Consultando lista paginada de todos los conductores. Page: {}, Size: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        
        return userRepository.findUsersByRole(Role.DRIVER, pageable)
                .map(this::toResponse); // Mapeamos de Dominio a DTO
    }

    // MAPEO MANUAL: De Dominio a DTO
    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus()
        );
    }
}