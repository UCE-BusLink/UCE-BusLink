package com.ucebuslink;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.ucebuslink")
public class UceBuslinkApplication {
    public static void main(String[] args) {
        SpringApplication.run(UceBuslinkApplication.class, args);
    }
}
