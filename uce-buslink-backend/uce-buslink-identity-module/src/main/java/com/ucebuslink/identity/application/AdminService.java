package com.ucebuslink.identity.application;

import com.ucebuslink.identity.domain.User;
import com.ucebuslink.identity.infrastructure.UserRepository;
import com.ucebuslink.shared.constant.Role;
import com.ucebuslink.shared.constant.UserStatus;
import com.ucebuslink.shared.dto.CreateDriverRequest;
import com.ucebuslink.shared.dto.DriverCreatedResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public DriverCreatedResponse createDriver(CreateDriverRequest request) {
        // 1. Validar si el correo ya existe
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("El correo ya está registrado en el sistema");
        }

        // 2. Crear la entidad User
        User driver = new User();
        driver.setFirstName(request.nombres());
        driver.setLastName(request.apellidos());
        driver.setEmail(request.email());
        driver.setRole(Role.DRIVER); // Forzamos el rol a DRIVER (Criterio de aceptación)
        driver.setStatus(UserStatus.ACTIVE);
        driver.setFailedLoginAttempts(0);

        // 3. Hashear la contraseña temporal
        driver.setPasswordHash(passwordEncoder.encode(request.password()));

        // 4. Guardar en Base de Datos
        User savedDriver = userRepository.save(driver);

        // 5. Retornar el DTO con el ID generado
        return new DriverCreatedResponse(
                savedDriver.getId(),
                savedDriver.getEmail(),
                "Conductor creado exitosamente"
        );
    }
}