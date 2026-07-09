package com.ucebuslink.identity.infrastructure.config;

import com.ucebuslink.identity.application.AdminService;
import com.ucebuslink.identity.domain.repository.UserRepository;
import com.ucebuslink.shared.dto.CreateDriverRequest;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DriverDataSeeder implements CommandLineRunner {

    private final AdminService adminService;
    private final UserRepository userRepository;

    public DriverDataSeeder(AdminService adminService, UserRepository userRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Checking test drivers (Seeder)...");

        // Driver 1: Carlos
        if (!userRepository.existsByEmail("carlos.driver@uce.edu.ec")) {
            try {
                CreateDriverRequest carlos = new CreateDriverRequest(
                        "Carlos",
                        "Conductor",
                        "carlos.driver@uce.edu.ec",
                        "DriverUce2026*" // Strong password so Clerk does not reject it
                );
                adminService.createDriver(carlos);
                System.out.println("Driver Carlos created in Clerk and DB.");
            } catch (Exception e) {
                System.err.println("Error creating Carlos: " + e.getMessage());
            }
        }

        // Driver 2: Luis
        if (!userRepository.existsByEmail("luis.driver@uce.edu.ec")) {
            try {
                CreateDriverRequest luis = new CreateDriverRequest(
                        "Luis",
                        "Volante",
                        "luis.driver@uce.edu.ec",
                        "DriverUce2026*"
                );
                adminService.createDriver(luis);
                System.out.println("Driver Luis created in Clerk and DB.");
            } catch (Exception e) {
                System.err.println("Error creating Luis: " + e.getMessage());
            }
        }
    }
}