package com.ucebuslink.identity.application;

import com.ucebuslink.identity.domain.model.User;
import com.ucebuslink.identity.domain.repository.UserRepository;
import com.ucebuslink.identity.infrastructure.external.clerk.ClerkClient; // Importamos tu cliente
import com.ucebuslink.shared.constant.Role;
import com.ucebuslink.shared.constant.UserStatus;
import com.ucebuslink.shared.dto.CreateDriverRequest;
import com.ucebuslink.shared.dto.DriverCreatedResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ClerkClient clerkClient; // 1. Añadimos el cliente de Clerk

    public AdminService(UserRepository userRepository, ClerkClient clerkClient) {
        this.userRepository = userRepository;
        this.clerkClient = clerkClient;
    }

    @Transactional // Buena práctica: asegura que si falla la BD, no queden datos a medias
    public DriverCreatedResponse createDriver(CreateDriverRequest request) {
        
        // 1. Validar si el correo ya existe en tu BD local
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("El correo ya está registrado en el sistema local");
        }

        // 2. Crear el usuario en Clerk PRIMERO
        String clerkUserId;
        try {
            // Asumo que tu CreateDriverRequest tiene un método password() o contraseña()
            clerkUserId = clerkClient.createUser(
                    request.email(),
                    request.password(), 
                    request.nombres(),
                    request.apellidos()
            );
        } catch (Exception e) {
            // Si Clerk falla (por ejemplo, la contraseña es muy débil o el correo ya existe allá)
            throw new RuntimeException("Error al crear el conductor en Clerk: " + e.getMessage());
        }

        // 3. Crear la entidad User para tu base de datos
        User driver = new User();
        driver.setFirstName(request.nombres());
        driver.setLastName(request.apellidos());
        driver.setEmail(request.email());
        driver.setRole(Role.DRIVER); 
        driver.setStatus(UserStatus.ACTIVE);
        driver.setFailedLoginAttempts(0);
        
        // 4. MUY IMPORTANTE: Asignar el ID generado por Clerk a tu entidad
        driver.setClerkUserId(clerkUserId);

        // Ya NO necesitas esto, Clerk maneja el hash y la validación de contraseñas de forma segura
        // driver.setPasswordHash(passwordEncoder.encode(request.password()));

        // 5. Guardar en la Base de Datos local
        User savedDriver = userRepository.save(driver);

        // 6. Retornar el DTO de éxito
        return new DriverCreatedResponse(
                savedDriver.getId(),
                savedDriver.getEmail(),
                "Conductor creado exitosamente en Clerk y BD local"
        );
    }
}