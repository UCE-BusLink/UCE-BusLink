package com.ucebuslink.tracking.application.service;

import com.ucebuslink.tracking.application.dto.SupervisorSnapshotPayload;
import com.ucebuslink.tracking.application.dto.SupervisorSnapshotPayload.BusSnapshot;
import com.ucebuslink.tracking.application.dto.SupervisorSnapshotPayload.NetworkStatistics;
import com.ucebuslink.tracking.application.port.TrackingQueryPort;
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
    private final TrackingQueryPort trackingQueryPort; // Uncomment when implementing the port

    // Runs every 5000 milliseconds (5 seconds)
    @Scheduled(fixedRate = 5000)
    public void buildAndBroadcastSnapshot() {
        List<BusSnapshot> activeBuses = new ArrayList<>();
        int totalStudents = 0;
        int totalBoarded = 0;
        int availableSeats = 0;

        // 1. Scan Redis looking for ALL active location keys
        // We use SCAN instead of KEYS to avoid blocking Redis when there are many connections
        ScanOptions options = ScanOptions.scanOptions().match("bus:*:location").count(100).build();
        try (Cursor<String> cursor = redisTemplate.scan(options)) {
            while (cursor.hasNext()) {
                String key = cursor.next();
                Object value = redisTemplate.opsForValue().get(key);

                if (value instanceof BusLocation location) {

                    // AGGREGATION LOGIC (Uncomment when implementing the port)
                    UUID tripId = trackingQueryPort.getActiveTripIdByBus(location.busId());

                    if (tripId != null) {

                        String plate = trackingQueryPort.getBusPlateNumber(location.busId());
                        String route = trackingQueryPort.getRouteNameByTrip(tripId);
                        int occupied = trackingQueryPort.getTripOccupiedSeats(tripId);
                        int boarded = trackingQueryPort.getBoardedStudentCount(tripId);
                        int capacity = trackingQueryPort.getBusTotalCapacity(location.busId());

                        activeBuses.add(new BusSnapshot(
                                location.busId().toString(),
                                plate,
                                location.latitude(),
                                location.longitude(),
                                location.velocity(),
                                tripId.toString(),
                                route,
                                occupied,
                                boarded,
                                capacity,
                                "ACTIVE",
                                location.timestamp()));

                        totalStudents += occupied;
                        totalBoarded += boarded;
                        availableSeats += (capacity - occupied);
                    }

                }
            }
        } catch (Exception e) {
            log.error("[TRACKING-SNAPSHOT] Error reading locations from Redis.", e);
            return;
        }

        if (activeBuses.isEmpty()) {
            return; // Avoid flooding the websocket when no buses are operating
        }

        // 2. Build Global Statistics
        NetworkStatistics stats = new NetworkStatistics(activeBuses.size(), totalStudents, totalBoarded, 0, availableSeats);
        SupervisorSnapshotPayload payload = new SupervisorSnapshotPayload(activeBuses, stats);

        // 3. Broadcast to the supervisors' mass channel
        messagingTemplate.convertAndSend("/topic/supervisor/all-buses", payload);
        log.trace("[TRACKING-SNAPSHOT] Snapshot of {} buses sent to the supervisor.", activeBuses.size());
    }
}