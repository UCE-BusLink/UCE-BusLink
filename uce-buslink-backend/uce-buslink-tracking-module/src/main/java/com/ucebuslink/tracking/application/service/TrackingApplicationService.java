package com.ucebuslink.tracking.application.service;

import com.ucebuslink.tracking.application.dto.GpsUpdatePayload;
import com.ucebuslink.tracking.application.dto.LocationBroadcastPayload;
import com.ucebuslink.tracking.application.port.out.TrackingQueryPort;
import com.ucebuslink.tracking.domain.model.BusLocation;
import com.ucebuslink.tracking.domain.repository.BusLocationRepository;
import com.ucebuslink.tracking.domain.service.ETACalculator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrackingApplicationService {

    private final BusLocationRepository busLocationRepository;
    private final TrackingQueryPort trackingQueryPort;
    private final ETACalculator etaCalculator;
    private final SimpMessagingTemplate messagingTemplate;

    public void processGpsUpdate(GpsUpdatePayload payload, String driverId) {
        log.debug("[TRACKING] Procesando actualización GPS del bus {} enviada por conductor {}", payload.busId(), driverId);

        BusLocation location = new BusLocation(
                payload.busId(),
                payload.latitude(),
                payload.longitude(),
                payload.accuracy(),
                payload.velocity(),
                payload.timestamp()
        );

        busLocationRepository.saveLocation(location);

        // TODO: (Para la Tarea 041 y 042)
        // - Lanzar evento asíncrono para que se guarde el historial en Postgres sin bloquear el hilo.
        // - Calcular distancia con Haversine y emitir a los estudiantes.

        //BROADCAST
        UUID activeTripId = trackingQueryPort.getActiveTripIdByBus(payload.busId());
        if (activeTripId == null) {
            return;
        }

        // 2. Calcular ETA con Haversine
        double[] nextStopCoords = trackingQueryPort.getNextStopCoordinates(activeTripId);
        String nextStopName = trackingQueryPort.getNextStopName(activeTripId);
        int eta = 99;

        if (nextStopCoords != null && nextStopCoords.length == 2) {
            double distanceKm = etaCalculator.calculateDistanceKm(
                    payload.latitude(), payload.longitude(), 
                    nextStopCoords[0], nextStopCoords[1]
            );
            eta = etaCalculator.estimateTimeToArriveMinutes(distanceKm, payload.velocity());
        }

        // 3. Crear el JSON ultra-ligero para los celulares
        LocationBroadcastPayload broadcast = new LocationBroadcastPayload(
                payload.busId(), activeTripId, payload.latitude(), 
                payload.longitude(), payload.velocity(), eta, nextStopName
        );

        // 4. Emitir el mensaje al tópico específico de este viaje
        String destination = "/topic/trip/" + activeTripId + "/location-update";
        messagingTemplate.convertAndSend(destination, broadcast);
        log.trace("[TRACKING] Broadcast enviado a {}", destination);
    }
}