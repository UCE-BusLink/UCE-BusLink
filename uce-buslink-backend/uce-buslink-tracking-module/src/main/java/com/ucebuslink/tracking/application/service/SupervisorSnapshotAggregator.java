package com.ucebuslink.tracking.application.service;

import com.ucebuslink.tracking.application.dto.SupervisorSnapshotPayload;
import com.ucebuslink.tracking.application.dto.SupervisorSnapshotPayload.BusSnapshot;
import com.ucebuslink.tracking.application.dto.SupervisorSnapshotPayload.NetworkStatistics;
import com.ucebuslink.tracking.application.port.out.TrackingQueryPort;
import com.ucebuslink.tracking.domain.model.BusLocation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupervisorSnapshotAggregator {

    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final TrackingQueryPort trackingQueryPort; // Descomentar cuando implementes el puerto

    // Se ejecuta cada 5000 milisegundos (5 segundos)
    @Scheduled(fixedRate = 5000)
    public void buildAndBroadcastSnapshot() {
        List<BusSnapshot> activeBuses = new ArrayList<>();
        int totalStudents = 0;
        int availableSeats = 0;

        // 1. Escanear Redis buscando TODAS las llaves de ubicaciones activas
        // Usamos SCAN en lugar de KEYS para no bloquear Redis si hay muchas conexiones
        ScanOptions options = ScanOptions.scanOptions().match("bus:*:location").count(100).build();
        try (Cursor<String> cursor = redisTemplate.scan(options)) {
            while (cursor.hasNext()) {
                String key = cursor.next();
                Object value = redisTemplate.opsForValue().get(key);
                
                if (value instanceof BusLocation location) {
                    
                    //LÓGICA DE AGREGACIÓN (Descomentar al implementar puerto)
                    UUID tripId = trackingQueryPort.getActiveTripIdByBus(location.busId());
                    
                    if (tripId != null) {
                        String plate = trackingQueryPort.getBusPlateNumber(location.busId());
                        String route = trackingQueryPort.getRouteNameByTrip(tripId);
                        int occupied = trackingQueryPort.getTripOccupiedSeats(tripId);
                        int capacity = trackingQueryPort.getBusTotalCapacity(location.busId());

                        activeBuses.add(new BusSnapshot(
                                location.busId().toString(), plate, location.latitude(), location.longitude(),
                                location.velocity(), tripId.toString(), route, occupied, capacity, 
                                "ACTIVE", location.timestamp()
                        ));

                        totalStudents += occupied;
                        availableSeats += (capacity - occupied);
                    }
                    
                   
                   // MOCK temporal para que no falle mientras implementas el puerto
                   activeBuses.add(new BusSnapshot(
                                location.busId().toString(), "UIO-123", location.latitude(), location.longitude(),
                                location.velocity(), "TRIP-UUID-MOCK", "Ruta Mock", 5, 20, 
                                "ACTIVE", location.timestamp()
                   ));
                }
            }
        } catch (Exception e) {
            log.error("[TRACKING-SNAPSHOT] Error al leer ubicaciones de Redis.", e);
            return;
        }

        if (activeBuses.isEmpty()) {
            return; // No saturar el websocket si no hay buses operando
        }

        // 2. Construir Estadísticas Globales
        NetworkStatistics stats = new NetworkStatistics(activeBuses.size(), totalStudents, 0, availableSeats);
        SupervisorSnapshotPayload payload = new SupervisorSnapshotPayload(activeBuses, stats);

        // 3. Emitir al canal masivo de supervisores
        messagingTemplate.convertAndSend("/topic/supervisor/all-buses", payload);
        log.trace("[TRACKING-SNAPSHOT] Snapshot de {} buses enviado al supervisor.", activeBuses.size());
    }
}