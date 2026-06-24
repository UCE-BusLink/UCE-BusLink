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
// @Profile("dev") // Descomenta esto en producción para que no corra accidentalmente
public class BusSimulatorMock {

    private final TrackingApplicationService trackingApplicationService;
    
    // Un UUID de bus que sepas que existe en tu base de datos (copialo de tu BD)
    private final UUID mockBusId = UUID.fromString("f1e5d4ca-dbce-44b7-bb82-b6806a21f6cd"); 
    
    // Coordenadas iniciales (Ej: Entrada de la UCE)
    private double currentLat = -0.1993;
    private double currentLon = -78.5053;

    @Scheduled(fixedRate = 2000) // Simula que el celular del chofer envía datos cada 2 segundos
    public void simulateGpsPing() {
        // Movemos el bus un poquito hacia el norte en cada "ping"
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

        // Inyectamos directo al servicio, simulando que llegó por WebSocket Inbound
        trackingApplicationService.processGpsUpdate(payload, "simulated-driver-id");
        log.trace("[SIMULADOR] Ping GPS enviado para el bus {}", mockBusId);
    }
}