package com.ucebuslink.tracking.infrastructure.persistence.repository;

import com.ucebuslink.tracking.domain.model.BusLocation;
import com.ucebuslink.tracking.domain.repository.BusLocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisBusLocationRepositoryAdapter implements BusLocationRepository {

    private final RedisTemplate<String, Object> redisTemplate;

    // Prefixes for our Redis keys
    private static final String LOCATION_KEY_PREFIX = "bus:%s:location";
    private static final String GEO_INDEX_KEY = "buses:active:geo";
    
    // Safety TTL: If a bus disconnects or enters a tunnel and does not send GPS,
    // its location automatically expires in Redis after 15 minutes to avoid "ghost buses".
    private static final Duration LOCATION_TTL = Duration.ofMinutes(15);

    @Override
    public void saveLocation(BusLocation location) {
        String key = String.format(LOCATION_KEY_PREFIX, location.busId());

        try {
            // 1. Save the full payload as JSON with expiration (TTL)
            redisTemplate.opsForValue().set(key, location, LOCATION_TTL);

            // 2. Save the exact coordinates in the Redis Geospatial index
            // Redis GEOADD expects LONGITUDE first, then LATITUDE
            Point geoPoint = new Point(location.longitude(), location.latitude());
            redisTemplate.opsForGeo().add(GEO_INDEX_KEY, geoPoint, location.busId().toString());
            
            log.trace("[REDIS-TRACKING] Location successfully updated for Bus: {}", location.busId());
        } catch (Exception e) {
            log.error("[REDIS-TRACKING] Error saving location to Redis for Bus: {}", location.busId(), e);
        }
    }

    @Override
    public Optional<BusLocation> getLocationByBusId(UUID busId) {
        String key = String.format(LOCATION_KEY_PREFIX, busId);
        
        try {
            Object result = redisTemplate.opsForValue().get(key);
            if (result instanceof BusLocation) {
                return Optional.of((BusLocation) result);
            }
        } catch (Exception e) {
            log.error("[REDIS-TRACKING] Error reading location from Redis for Bus: {}", busId, e);
        }
        return Optional.empty();
    }

    @Override
    public void removeLocation(UUID busId) {
        String key = String.format(LOCATION_KEY_PREFIX, busId);
        try {
            // Remove the JSON
            redisTemplate.delete(key);
            // Remove from the geospatial index
            redisTemplate.opsForGeo().remove(GEO_INDEX_KEY, busId.toString());
            log.debug("[REDIS-TRACKING] Bus {} location removed from active memory.", busId);
        } catch (Exception e) {
            log.error("[REDIS-TRACKING] Error removing location from Redis for Bus: {}", busId, e);
        }
    }
}