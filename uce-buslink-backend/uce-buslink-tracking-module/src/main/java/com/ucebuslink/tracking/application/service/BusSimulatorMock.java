package com.ucebuslink.tracking.application.service;

import com.ucebuslink.tracking.application.dto.GpsUpdatePayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
// @Profile("dev")
public class BusSimulatorMock {

    private final TrackingApplicationService trackingApplicationService;
    
    private final UUID mockBusId = UUID.fromString("f1e5d4ca-dbce-44b7-bb82-b6806a21f6cd"); 
    
    private double currentLat = -0.1993;
    private double currentLon = -78.5053;

    // @Scheduled(fixedRate = 2000)
    public void simulateGpsPing() {

        currentLat += 0.0001; 
        currentLon += 0.0001;

        GpsUpdatePayload payload = new GpsUpdatePayload(
                mockBusId,
                currentLat,
                currentLon,
                5.0, // accuracy
                45.5, // velocidad en km/h
                Instant.now().toEpochMilli()
        );

        trackingApplicationService.processGpsUpdate(payload, "simulated-driver-id");
        log.trace("[SIMULADOR] Ping GPS enviado para el bus {}", mockBusId);
    }
}
