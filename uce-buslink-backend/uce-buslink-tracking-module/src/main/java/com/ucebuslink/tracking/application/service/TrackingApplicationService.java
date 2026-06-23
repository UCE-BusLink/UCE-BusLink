package com.ucebuslink.tracking.application.service;

import com.ucebuslink.tracking.application.dto.GpsUpdatePayload;
import com.ucebuslink.tracking.domain.model.BusLocation;
import com.ucebuslink.tracking.domain.repository.BusLocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrackingApplicationService {

    private final BusLocationRepository busLocationRepository;

    public void processGpsUpdate(GpsUpdatePayload payload, String driverId) {
        log.debug("[TRACKING] Procesando actualización GPS del bus {} enviada por conductor {}", payload.busId(), driverId);

        // 1. Mapear a nuestro Value Object de dominio
        BusLocation location = new BusLocation(
                payload.busId(),
                payload.latitude(),
                payload.longitude(),
                payload.accuracy(),
                payload.velocity(),
                payload.timestamp()
        );

        // 2. Guardar en la memoria ultra-rápida de Redis (JSON y GeoSpatial)
        busLocationRepository.saveLocation(location);

        // TODO: (Para la Tarea 041 y 042)
        // - Lanzar evento asíncrono para que se guarde el historial en Postgres sin bloquear el hilo.
        // - Calcular distancia con Haversine y emitir a los estudiantes.

        /* * LÓGICA DE BROADCAST (Descomentar e integrar con trackingQueryPort)
         * UUID activeTripId = trackingQueryPort.getActiveTripIdByBus(payload.busId());
        if (activeTripId == null) {
            return; // El bus está encendido pero no está haciendo ninguna ruta oficial
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
        */
    }
}