package com.ucebuslink;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.ucebuslink")
@EnableCaching
@EnableScheduling
public class UceBuslinkApplication {
    public static void main(String[] args) {
        SpringApplication.run(UceBuslinkApplication.class, args);
    }
}
