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

    // Prefijos para nuestras llaves en Redis
    private static final String LOCATION_KEY_PREFIX = "bus:%s:location";
    private static final String GEO_INDEX_KEY = "buses:active:geo";
    
    // TTL de seguridad: Si un bus se desconecta o entra a un túnel y no envía GPS, 
    // su ubicación expira en Redis automáticamente después de 15 minutos para evitar "buses fantasma".
    private static final Duration LOCATION_TTL = Duration.ofMinutes(15);

    @Override
    public void saveLocation(BusLocation location) {
        String key = String.format(LOCATION_KEY_PREFIX, location.busId());

        try {
            // 1. Guardar el payload completo en JSON con expiración (TTL)
            redisTemplate.opsForValue().set(key, location, LOCATION_TTL);

            // 2. Guardar las coordenadas exactas en el índice Geoespacial de Redis
            // Redis GEOADD espera primero LONGITUD y luego LATITUD
            Point geoPoint = new Point(location.longitude(), location.latitude());
            redisTemplate.opsForGeo().add(GEO_INDEX_KEY, geoPoint, location.busId().toString());
            
            log.trace("[REDIS-TRACKING] Localización actualizada exitosamente para Bus: {}", location.busId());
        } catch (Exception e) {
            log.error("[REDIS-TRACKING] Error al guardar localización en Redis para Bus: {}", location.busId(), e);
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
            log.error("[REDIS-TRACKING] Error al leer localización de Redis para Bus: {}", busId, e);
        }
        return Optional.empty();
    }

    @Override
    public void removeLocation(UUID busId) {
        String key = String.format(LOCATION_KEY_PREFIX, busId);
        try {
            // Eliminar el JSON
            redisTemplate.delete(key);
            // Eliminar del índice geoespacial
            redisTemplate.opsForGeo().remove(GEO_INDEX_KEY, busId.toString());
            log.debug("[REDIS-TRACKING] Ubicación del Bus {} eliminada de la memoria activa.", busId);
        } catch (Exception e) {
            log.error("[REDIS-TRACKING] Error al eliminar localización de Redis para Bus: {}", busId, e);
        }
    }
}