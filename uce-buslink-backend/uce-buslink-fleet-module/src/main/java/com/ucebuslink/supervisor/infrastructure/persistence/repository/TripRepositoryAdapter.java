package com.ucebuslink.supervisor.infrastructure.persistence.repository;

import com.ucebuslink.supervisor.domain.model.Trip;
import com.ucebuslink.supervisor.domain.repository.TripRepository;
import com.ucebuslink.supervisor.infrastructure.persistence.entity.TripJpaEntity;
import com.ucebuslink.supervisor.infrastructure.persistence.mapper.SupervisorMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class TripRepositoryAdapter implements TripRepository {

    private final SpringDataTripRepository jpaRepository;
    private final SupervisorMapper mapper;

    @Override
    public Trip save(Trip trip) {
        log.debug("[FLEET-TRIP] Guardando viaje. Estado actual: {}, Bus ID: {}, Ruta ID: {}", 
                trip.getState(), trip.getBusId(), trip.getRouteId());
        
        TripJpaEntity entity = mapper.toJpa(trip);
        TripJpaEntity savedEntity = jpaRepository.save(entity);
        
        log.info("[FLEET-TRIP] Viaje guardado exitosamente con ID: {}", savedEntity.getId());
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Trip> findById(UUID id) {
        log.debug("[FLEET-TRIP] Buscando viaje por ID: {}", id);
        return jpaRepository.findById(id).map(mapper::toDomain);
    }
}