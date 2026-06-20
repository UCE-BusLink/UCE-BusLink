package com.ucebuslink.supervisor.infrastructure.persistence.repository;

import com.ucebuslink.supervisor.domain.model.Route;
import com.ucebuslink.supervisor.domain.model.RouteStop;
import com.ucebuslink.supervisor.domain.repository.RouteRepository;
import com.ucebuslink.supervisor.domain.repository.StopRepository;
import com.ucebuslink.supervisor.infrastructure.persistence.entity.RouteJpaEntity;
import com.ucebuslink.supervisor.infrastructure.persistence.entity.RouteStopJpaEntity;
import com.ucebuslink.supervisor.infrastructure.persistence.entity.StopJpaEntity;
import com.ucebuslink.supervisor.infrastructure.persistence.mapper.SupervisorMapper;

import jakarta.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import com.ucebuslink.shared.dto.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

@Repository
public class RouteRepositoryAdapter implements RouteRepository {

    private static final Logger log = LoggerFactory.getLogger(RouteRepositoryAdapter.class);

    private final SpringDataRouteRepository springDataRouteRepository;
    private final SupervisorMapper supervisorMapper;
    private final StopRepository stopRepository;

    public RouteRepositoryAdapter(SpringDataRouteRepository springDataRouteRepository, SupervisorMapper supervisorMapper, StopRepository stopRepository) {
        this.springDataRouteRepository = springDataRouteRepository;
        this.supervisorMapper = supervisorMapper;
        this.stopRepository = stopRepository;
    }

    @SuppressWarnings("null")
    @Override
    public Route save(Route route) {
        log.info("Saving route with id: {}", route.getId());
        RouteJpaEntity jpaEntity = supervisorMapper.toJpa(route);
        RouteJpaEntity saved = springDataRouteRepository.save(jpaEntity);
        log.debug("Route saved successfully");
        return supervisorMapper.toDomain(saved);
    }

    @Override
    public Optional<Route> findById(UUID id) {
        log.info("Finding route by id: {}", id);
        return springDataRouteRepository.findByIdAndDeletedAtIsNull(id)
                .map(supervisorMapper::toDomain);
    }

    @Override
    public PageResponse<Route> findAll(boolean isActive, int page, int size) {
        log.info("Fetching paginated routes. Active: {}, Page: {}, Size: {}", isActive, page, size);
        Page<RouteJpaEntity> entityPage = springDataRouteRepository.findByDeletedAtIsNullAndIsActive(isActive, PageRequest.of(page, size));
        
        List<Route> routes = entityPage.getContent().stream()
                .map(supervisorMapper::toDomain)
                .collect(Collectors.toList());
                
        return new PageResponse<>(
                routes,
                entityPage.getNumber(),
                entityPage.getSize(),
                entityPage.getTotalElements(),
                entityPage.getTotalPages()
        );
    }

    @Override
    public List<Route> findAllActive() {
        log.info("Fetching all active routes (Optimized query)");
        long startTime = System.currentTimeMillis();
        
        List<RouteJpaEntity> entities = springDataRouteRepository.findAllActiveRoutes();
        
        log.debug("Found {} active routes in {} ms", entities.size(), (System.currentTimeMillis() - startTime));
        return entities.stream()
                .map(supervisorMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(UUID id) {
        log.info("Soft deleting route with id: {}", id);
        springDataRouteRepository.findByIdAndDeletedAtIsNull(id).ifPresent(entity -> {
            entity.setDeletedAt(LocalDateTime.now());
            springDataRouteRepository.save(entity);
            log.debug("Route {} soft deleted successfully", id);
        });
    }

    @Override
    public List<Route> findRoutesByStopId(UUID stopId) {
        log.info("Finding routes that include stop id: {}", stopId);
        return springDataRouteRepository.findByStopId(stopId).stream()
                .map(supervisorMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeStopFromRoutes(UUID stopId) {
        log.info("Removing stop {} from all associated routes", stopId);
        List<RouteJpaEntity> routes = springDataRouteRepository.findByStopId(stopId);

        for (RouteJpaEntity route : routes) {
            boolean removed = route.getRouteStops()
                    .removeIf(rs -> rs.getStop().getId().equals(stopId));
            
            if (removed) {
                log.debug("Reordering stops for route: {}", route.getId());
                int order = 1;
                for (RouteStopJpaEntity rs : route.getRouteStops()) {
                    rs.setStopOrder(order++);
                }
            }
        }
        log.info("[Route] Stop removal and route reordering completed");
    }

    @Transactional
    public Route update(Route route) {

        RouteJpaEntity entity = springDataRouteRepository.findById(route.getId())
                .orElseThrow(() -> new RuntimeException("Route not found: " + route.getId()));

        // Datos básicos
        entity.setName(route.getName());
        entity.setDescription(route.getDescription());
        entity.setIsActive(route.getIsActive());
        entity.setEstimatedDurationMinutes(route.getEstimatedDurationMinutes());
        entity.setPathPolyline(route.getPathPolyline());
        entity.setUpdatedBy(route.getUpdatedBy());

        // Sincronizar relaciones en lugar de limpiarlas a ciegas
        if (route.getRouteStops() != null) {
            
            // 1. Recopilar los IDs de las paradas entrantes
            java.util.Set<UUID> incomingStopIds = route.getRouteStops().stream()
                    .map(rs -> rs.getStop().getId())
                    .collect(Collectors.toSet());

            // 2. Eliminar de la entidad las paradas que ya no existen en la petición
            entity.getRouteStops().removeIf(rsEntity -> 
                    !incomingStopIds.contains(rsEntity.getStop().getId()));

            // 3. Actualizar las paradas que se mantienen o agregar las nuevas
            for (RouteStop rs : route.getRouteStops()) {
                UUID stopId = rs.getStop().getId();

                Optional<RouteStopJpaEntity> existingRsOpt = entity.getRouteStops().stream()
                        .filter(e -> e.getStop().getId().equals(stopId))
                        .findFirst();

                if (existingRsOpt.isPresent()) {
                    // Si ya existe la relación, SOLO actualizamos sus atributos
                    RouteStopJpaEntity existingRs = existingRsOpt.get();
                    existingRs.setStopOrder(rs.getStopOrder());
                    existingRs.setEstimatedMinutesFromStart(rs.getEstimatedMinutesFromStart());
                } else {
                    // Si no existe, creamos una nueva instancia
                    StopJpaEntity stopEntity = stopRepository.getReferenceById(stopId);
                    
                    RouteStopJpaEntity newRsEntity = new RouteStopJpaEntity();
                    newRsEntity.setStop(stopEntity);
                    newRsEntity.setStopOrder(rs.getStopOrder());
                    newRsEntity.setEstimatedMinutesFromStart(rs.getEstimatedMinutesFromStart());

                    entity.addStop(newRsEntity);
                }
            }
        } else {
            entity.getRouteStops().clear();
        }

        RouteJpaEntity saved = springDataRouteRepository.save(entity);

        return supervisorMapper.toDomain(saved);
    }
}