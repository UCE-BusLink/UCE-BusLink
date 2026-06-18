package com.ucebuslink;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication(scanBasePackages = "com.ucebuslink")
@EnableCaching
public class UceBuslinkApplication {
    public static void main(String[] args) {
        SpringApplication.run(UceBuslinkApplication.class, args);
    }
}
